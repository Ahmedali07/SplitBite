import { supabase } from "@/lib/supabaseClient";
import type { Group } from "@/types/database";

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("is_closed", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGroupById(id: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createGroup(
  name: string,
  createdBy: string
): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, created_by: createdBy })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
