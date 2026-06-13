"use client";

import { useState } from "react";
import type { Group } from "@/types/database";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createGroup } from "@/lib/services/groups";
import { addMemberToGroup } from "@/lib/services/members";

type CreateGroupModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (group: Group) => void;
};

export function CreateGroupModal({
  open,
  onClose,
  onCreated,
}: CreateGroupModalProps) {
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !profile) return;

    setLoading(true);
    setError(null);

    try {
      const group = await createGroup(name.trim(), profile.id);
      await addMemberToGroup(group.id, profile.id);
      onCreated(group);
      setName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setLoading(false);
    }
  }

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
        Cancel
      </Button>
      <Button type="submit" form="create-group-form" disabled={loading || !profile} fullWidth className="sm:w-auto">
        {loading ? "Creating…" : "Create"}
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Create Group" footer={footer}>
      <form id="create-group-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="group-name"
          label="Group name"
          placeholder="Weekend trip, Apartment, etc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {profile && (
          <p className="text-sm text-slate-500">
            You&apos;ll be added as <span className="font-medium text-slate-700">{profile.name}</span>
          </p>
        )}
        {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
      </form>
    </Modal>
  );
}
