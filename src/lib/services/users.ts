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
