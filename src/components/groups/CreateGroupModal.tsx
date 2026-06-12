"use client";

import { useState } from "react";
import type { Group } from "@/types/database";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createGroup } from "@/lib/services/groups";
import { createUser } from "@/lib/services/users";
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
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !creatorName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const user = await createUser(creatorName.trim());
      const group = await createGroup(name.trim(), user.id);
      await addMemberToGroup(group.id, user.id);
      onCreated(group);
      setName("");
      setCreatorName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="group-name"
          label="Group name"
          placeholder="Weekend trip, Apartment, etc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="creator-name"
          label="Your name"
          placeholder="How you'll appear in this group"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          required
        />
        {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} fullWidth className="sm:w-auto">
            {loading ? "Creating…" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
