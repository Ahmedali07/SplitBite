"use client";

import { useCallback, useEffect, useState } from "react";
import type { Group } from "@/types/database";
import { AppShell } from "@/components/layout/AppShell";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { GroupView } from "@/components/groups/GroupView";
import { Button } from "@/components/ui/Button";
import { GroupViewSkeleton } from "@/components/ui/Skeleton";
import { listGroups } from "@/lib/services/groups";
import { ToastProvider, useToast } from "@/lib/toast/ToastProvider";

function DashboardContent() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listGroups();
      setGroups(data);
      setSelectedGroupId((current) => {
        if (current && data.some((g) => g.id === current)) return current;
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  function handleGroupCreated(group: Group) {
    setGroups((prev) => [group, ...prev]);
    setSelectedGroupId(group.id);
    toast(`Group "${group.name}" created`, "success");
  }

  return (
    <AppShell
      groups={groups}
      selectedGroupId={selectedGroupId}
      selectedGroupName={selectedGroup?.name ?? null}
      onSelectGroup={setSelectedGroupId}
      onCreateGroup={() => setCreateModalOpen(true)}
    >
      {loading && groups.length === 0 ? (
        <GroupViewSkeleton />
      ) : error && groups.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              !
            </div>
            <p className="font-semibold text-red-800">Connection error</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <p className="mt-4 text-xs text-slate-500">
              Make sure you ran the SQL migration in Supabase and your env
              variables are set.
            </p>
            <Button className="mt-5" variant="secondary" fullWidth onClick={loadGroups}>
              Retry
            </Button>
          </div>
        </div>
      ) : selectedGroup ? (
        <GroupView key={selectedGroup.id} group={selectedGroup} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-sm">
              SB
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome to SplitBite
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Create a group to start splitting expenses with flexible
              per-expense participant splits.
            </p>
            <Button
              className="mt-6"
              fullWidth
              onClick={() => setCreateModalOpen(true)}
            >
              + Create your first group
            </Button>
          </div>
        </div>
      )}

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleGroupCreated}
      />
    </AppShell>
  );
}

export function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
