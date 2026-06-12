import { supabase } from "@/lib/supabaseClient";
import { getUsersByIds } from "@/lib/services/users";
import type { GroupMemberWithUser } from "@/types/database";

export async function listGroupMembers(
  groupId: string
): Promise<GroupMemberWithUser[]> {
  const { data: members, error } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!members?.length) return [];

  const userIds = members.map((m) => m.user_id);
  const users = await getUsersByIds(userIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  return members.map((member) => ({
    ...member,
    user: userMap.get(member.user_id)!,
  }));
}

export async function addMemberToGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId });

  if (error) throw new Error(error.message);
}

export async function isGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}
