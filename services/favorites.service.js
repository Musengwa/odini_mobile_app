import { supabase } from "../lib/supabase";

export async function getFavorites() {
  // only fetch favorites for the authenticated user and include listing details
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      listing:listings (
        id,
        title,
        city,
        type,
        available_rooms
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function removeFavorite(favoriteId) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId);

  if (error) throw error;
}
