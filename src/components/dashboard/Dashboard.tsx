"use client";

import { useCallback, useEffect, useState } from "react";
import type { Group } from "@/types/database";
import { Sidebar } from "@/components/layout/Sidebar";
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onCreateGroup={() => setCreateModalOpen(true)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {loading && groups.length === 0 ? (
          <GroupViewSkeleton />
        ) : error && groups.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-medium text-red-800">Connection error</p>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <p className="mt-4 text-xs text-red-500">
                Make sure you ran the SQL migration in Supabase and your env
                variables are set.
              </p>
              <Button className="mt-4" variant="secondary" onClick={loadGroups}>
                Retry
              </Button>
            </div>
          </div>
        ) : selectedGroup ? (
          <GroupView key={selectedGroup.id} group={selectedGroup} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                Welcome to SplitBite
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Create a group to start splitting expenses with flexible
                per-expense participant splits.
              </p>
              <Button className="mt-6" onClick={() => setCreateModalOpen(true)}>
                + Create your first group
              </Button>
            </div>
          </div>
        )}
      </main>

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleGroupCreated}
      />
    </div>
  );
}

export function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
