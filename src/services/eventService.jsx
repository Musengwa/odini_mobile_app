import supabase from '../config/supabaseClient';

/**
 * Event service
 * 
 * Assumptions about Supabase schema (adapt if your schema differs):
 * - events table: id, title, description, tags (text[]), category, ...
 * - event_ratings table: id, user_id, event_id, rating (1-5), comment, created_at
 * - user_trips table: id, user_id, event_id, created_at
 * - user_preferences table: id, user_id, tag (or category), score (numeric)
 *
 * This module exposes helpers to fetch events, add a rating, add events to trips,
 * and update user preference scores based on interactions.
 */

// Helper to get current user id if not provided
async function getCurrentUserId() {
  try {
    // supabase-js v2
    if (supabase.auth && supabase.auth.getUser) {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data?.user?.id ?? null;
    }

    // fallback for older API
    if (supabase.auth && supabase.auth.user) {
      const u = supabase.auth.user();
      return u?.id ?? null;
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch events with optional filters. Includes aggregated rating (avg) computed client-side.
 * @param {Object} opts
 * @param {number} opts.limit
 * @param {number} opts.offset
 * @param {string[]} opts.tags - filter events that contain all supplied tags
 * @param {string} opts.orderBy - column to order by (default: created_at)
 */
export async function fetchEvents({ limit = 50, offset = 0, tags = null, orderBy = 'created_at' } = {}) {
  try {
    let query = supabase.from('events').select('*, event_ratings(rating)');

    if (tags && Array.isArray(tags) && tags.length > 0) {
      // assumes "tags" is a Postgres text[] column
      query = query.contains('tags', tags);
    }

    // pagination
    query = query.range(offset, offset + limit - 1).order(orderBy, { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // compute avg rating per event
    const events = (data || []).map(evt => {
      const ratings = evt.event_ratings || [];
      const avgRating = ratings.length ? (ratings.reduce((s, r) => s + Number(r.rating || 0), 0) / ratings.length) : null;
      return { ...evt, avgRating, ratingsCount: ratings.length };
    });

    return events;
  } catch (err) {
    console.error('fetchEvents error', err);
    throw err;
  }
}

/**
 * Get a single event by id with ratings and average rating
 */
export async function getEventById(eventId) {
  if (!eventId) throw new Error('eventId is required');
  try {
    const { data, error } = await supabase.from('events').select('*, event_ratings(rating, user_id, comment, created_at)').eq('id', eventId).single();
    if (error) throw error;
    const ratings = data.event_ratings || [];
    const avgRating = ratings.length ? (ratings.reduce((s, r) => s + Number(r.rating || 0), 0) / ratings.length) : null;
    return { ...data, avgRating, ratingsCount: ratings.length };
  } catch (err) {
    console.error('getEventById error', err);
    throw err;
  }
}

/**
 * Compute preference delta based on rating.
 * Policy used: center rating around 3; delta = rating - 3.0
 * So 5 -> +2, 1 -> -2. Scale is configurable here.
 */
function computePreferenceDelta(rating, weight = 1.0) {
  const center = 3.0;
  const delta = (Number(rating) - center) * weight;
  return delta;
}

/**
 * Update user's preference scores for given tags (or categories).
 * Upserts each tag row (assumes unique constraint on (user_id, tag)).
 */
export async function updateUserPreferences(userId, tags = [], delta = 0) {
  if (!userId) throw new Error('userId required');
  if (!Array.isArray(tags) || tags.length === 0) return;

  try {
    // For each tag, fetch existing score, then upsert with new score
    // Note: this is done sequentially for clarity. If you have many tags you can batch these in parallel.
    for (const tag of tags) {
      const { data: existing, error: fetchErr } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('tag', tag)
        .single();
      if (fetchErr && fetchErr.code !== 'PGRST116') {
        // PGRST116 is "No rows found" in some setups; ignore if not found
        // but rethrow other errors
        // Avoid relying on code strings across versions; this is a best-effort pattern
      }

      const currentScore = existing?.score ?? 0;
      const newScore = Number(currentScore) + Number(delta);

      const payload = {
        user_id: userId,
        tag,
        score: newScore,
      };

      const { error: upsertErr } = await supabase.from('user_preferences').upsert(payload, { onConflict: ['user_id', 'tag'] });
      if (upsertErr) throw upsertErr;
    }

    return true;
  } catch (err) {
    console.error('updateUserPreferences error', err);
    throw err;
  }
}

/**
 * Add or update a rating from a user for an event. Also updates preference scores.
 * If a rating by the same user for the same event exists, we update it.
 * @param {Object} opts
 * @param {string} opts.userId - optional, will be taken from auth if not provided
 * @param {string} opts.eventId
 * @param {number} opts.rating - 1..5
 * @param {string} opts.comment
 */
export async function addRating({ userId = null, eventId, rating, comment = null } = {}) {
  if (!eventId) throw new Error('eventId required');
  if (!rating) throw new Error('rating required');

  const uid = userId || (await getCurrentUserId());
  if (!uid) throw new Error('user not authenticated');

  try {
    // Check if there is an existing rating by this user for this event
    const { data: existing, error: fetchErr } = await supabase
      .from('event_ratings')
      .select('*')
      .eq('user_id', uid)
      .eq('event_id', eventId)
      .single();

    if (fetchErr && fetchErr.code && fetchErr.code !== 'PGRST116') {
      // rethrow unexpected errors
      // continue if "no rows" found
    }

    if (existing && existing.id) {
      // Update existing rating
      const { error: updateErr } = await supabase
        .from('event_ratings')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (updateErr) throw updateErr;
    } else {
      // Insert new rating
      const { error: insertErr } = await supabase.from('event_ratings').insert({ user_id: uid, event_id: eventId, rating, comment });
      if (insertErr) throw insertErr;
    }

    // After rating, fetch event tags to update preferences
    const { data: event, error: eventErr } = await supabase.from('events').select('id, tags, category').eq('id', eventId).single();
    if (eventErr) throw eventErr;

    // determine tags to update
    const tags = event.tags || (event.category ? [event.category] : []);

    const delta = computePreferenceDelta(rating, 1.0);

    await updateUserPreferences(uid, tags, delta);

    // Return the updated event with new rating stats
    return await getEventById(eventId);
  } catch (err) {
    console.error('addRating error', err);
    throw err;
  }
}

/**
 * Add an event to a user's trip (user_trips table). Optionally takes a tripId if your schema supports trips/itineraries.
 * Also can update preferences positively to indicate stronger interest.
 */
export async function addToTrip({ userId = null, eventId, tripId = null } = {}) {
  if (!eventId) throw new Error('eventId required');
  const uid = userId || (await getCurrentUserId());
  if (!uid) throw new Error('user not authenticated');

  try {
    const payload = { user_id: uid, event_id: eventId };
    if (tripId) payload.trip_id = tripId;

    // prevent duplicates (optional) — assumes a unique constraint exists if you prefer
    const { error: insertErr } = await supabase.from('user_trips').insert(payload);
    if (insertErr) throw insertErr;

    // Positive preference bump for adding to trip
    const { data: event } = await supabase.from('events').select('tags, category').eq('id', eventId).single();
    const tags = event?.tags || (event?.category ? [event.category] : []);

    const delta = 0.75; // smaller positive bump than a 5-star rating
    await updateUserPreferences(uid, tags, delta);

    return true;
  } catch (err) {
    console.error('addToTrip error', err);
    throw err;
  }
}

/**
 * Get all events added to user's trips
 */
export async function getUserTripEvents(userId = null) {
  const uid = userId || (await getCurrentUserId());
  if (!uid) throw new Error('user not authenticated');
  try {
    const { data, error } = await supabase
      .from('user_trips')
      .select('event:events(*)')
      .eq('user_id', uid);
    if (error) throw error;
    return (data || []).map(r => r.event);
  } catch (err) {
    console.error('getUserTripEvents error', err);
    throw err;
  }
}

export async function getUserPreferences(userId = null) {
  const uid = userId || (await getCurrentUserId());
  if (!uid) throw new Error('user not authenticated');
  try {
    const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', uid);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getUserPreferences error', err);
    throw err;
  }
}

/**
 * Subscribe to event changes (INSERT, UPDATE, DELETE). Callback receives a payload describing the change.
 * Usage: const sub = subscribeToEvents(handleChange);
 * To unsubscribe: supabase.removeSubscription(sub) or sub.unsubscribe() depending on client version
 */
export function subscribeToEvents(onChange) {
  // This uses the Realtime (or PostgresChanges) interface
  try {
    const channel = supabase.channel('public:events').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
      onChange && onChange(payload);
    }).subscribe();

    return channel;
  } catch (err) {
    console.warn('subscribeToEvents not available or failed', err);
    return null;
  }
}

const eventService = {
  fetchEvents,
  getEventById,
  addRating,
  addToTrip,
  getUserTripEvents,
  getUserPreferences,
  updateUserPreferences,
  subscribeToEvents,
};

export default eventService;
 