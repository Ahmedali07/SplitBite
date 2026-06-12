import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@/types/database";

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getProfileByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createProfileForAuthUser(authUser: AuthUser): Promise<User> {
  const name =
    (authUser.user_metadata?.name as string | undefined) ??
    (authUser.user_metadata?.full_name as string | undefined) ??
    authUser.email?.split("@")[0] ??
    "User";

  const { data, error } = await supabase
    .from("users")
    .insert({
      auth_id: authUser.id,
      name,
      avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const existing = await getProfileByAuthId(authUser.id);
      if (existing) return existing;
    }
    throw new Error(error.message);
  }
  return data;
}

/** Create a name-only member (no linked auth account) for group invites. */
export async function createUser(name: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({ name })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("id", ids);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateProfileName(id: string, name: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
