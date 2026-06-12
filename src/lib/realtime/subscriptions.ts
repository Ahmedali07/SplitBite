import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

/**
 * Subscribe to group changes for real-time updates.
 * Call the returned unsubscribe function to clean up.
 */
export function subscribeToGroup(
  groupId: string,
  onChange: () => void
): () => void {
  const channels: RealtimeChannel[] = [];

  const expenseChannel = supabase
    .channel(`expenses-group-${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "expenses",
        filter: `group_id=eq.${groupId}`,
      },
      onChange
    )
    .subscribe();

  channels.push(expenseChannel);

  const membersChannel = supabase
    .channel(`members-group-${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "group_members",
        filter: `group_id=eq.${groupId}`,
      },
      onChange
    )
    .subscribe();

  channels.push(membersChannel);

  return () => {
    for (const channel of channels) {
      supabase.removeChannel(channel);
    }
  };
}
