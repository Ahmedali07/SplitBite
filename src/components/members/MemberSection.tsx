"use client";

import { useState } from "react";
import type { GroupMemberWithUser } from "@/types/database";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createUser } from "@/lib/services/users";
import { addMemberToGroup, isGroupMember } from "@/lib/services/members";

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
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
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
        <Button type="submit" disabled={loading} className="mb-0.5">
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
          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
        >
          <span className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
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
