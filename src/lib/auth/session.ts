/**
 * Auth placeholder — swap with Supabase Auth session when ready.
 * Returns null until real authentication is wired up.
 */
export async function getCurrentUserId(): Promise<string | null> {
  return null;
}

/**
 * Client-side local user id storage for pre-auth development.
 * Remove once Supabase Auth is integrated.
 */
export const LOCAL_USER_KEY = "splitbite_local_user_id";
