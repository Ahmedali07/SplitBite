import { supabase } from "@/lib/supabaseClient";
import { getProfileByAuthId } from "@/lib/services/users";

/**
 * Returns the signed-in user's profile id (public.users.id), or null.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByAuthId(user.id);
  return profile?.id ?? null;
}
