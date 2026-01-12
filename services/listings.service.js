import { supabase } from "../lib/supabase";

export async function getListings() {
  const { data, error } = await supabase
    .from("stays")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addToFavorites(userId, listingId) {
  const { error } = await supabase
    .from("favorites")
    .insert({
      user_id: userId,
      listing_id: listingId,
    });

  if (error) throw error;
}
