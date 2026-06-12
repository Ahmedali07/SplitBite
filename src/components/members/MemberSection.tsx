"use client";

import { useState } from "react";
import type { GroupMemberWithUser } from "@/types/database";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createUser } from "@/lib/services/users";
import { addMemberToGroup, isGroupMember } from "@/lib/services/members";

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type AddMemberFormProps = {
  groupId: string;
  existingMemberIds: string[];
  onAdded: (memberName: string) => void;
};

export function AddMemberForm({
  groupId,
  existingMemberIds,
  onAdded,
}: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const user = await createUser(trimmed);

      if (existingMemberIds.includes(user.id)) {
        setError("This person is already in the group.");
        return;
      }

      const alreadyMember = await isGroupMember(groupId, user.id);
      if (alreadyMember) {
        setError("This person is already in the group.");
        return;
      }

      await addMemberToGroup(groupId, user.id);
      setName("");
      onAdded(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            id="member-name"
            label="Add member"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading} fullWidth className="sm:mb-0.5 sm:w-auto">
          {loading ? "Adding…" : "Add"}
        </Button>
      </form>
      {error && (
        <Alert variant="error" className="mt-2" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
}

type MemberListProps = {
  members: GroupMemberWithUser[];
};

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member) => (
        <span
          key={member.id}
          className="inline-flex items-center gap-2 rounded-full bg-slate-50 py-1 pl-1 pr-3 text-sm text-slate-700 ring-1 ring-slate-200/80"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(member.user.name)}`}
          >
            {member.user.name.charAt(0).toUpperCase()}
          </span>
          {member.user.name}
        </span>
      ))}
      {members.length === 0 && (
        <p className="text-sm text-slate-500">No members yet.</p>
      )}
    </div>
  );
}
