"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExpenseWithDetails, Group } from "@/types/database";
import { SettlementSummary } from "@/components/balances/SettlementSummary";
import { BalanceSummary } from "@/components/balances/BalanceSummary";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { AddMemberForm, MemberList } from "@/components/members/MemberSection";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { GroupViewSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { computeUserBalances } from "@/lib/calculations/balances";
import { listExpenses, deleteExpense } from "@/lib/services/expenses";
import { listGroupMembers } from "@/lib/services/members";
import { subscribeToGroup } from "@/lib/realtime/subscriptions";
import { useToast } from "@/lib/toast/ToastProvider";

type GroupViewProps = {
  group: Group;
};

type DeleteTarget = {
  id: string;
  title: string;
};

export function GroupView({ group }: GroupViewProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listGroupMembers>>>([]);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const hasDataRef = useRef(false);

  const loadGroupData = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? hasDataRef.current;

      if (silent) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);

      try {
        const [memberData, expenseData] = await Promise.all([
          listGroupMembers(group.id),
          listExpenses(group.id),
        ]);
        setMembers(memberData);
        setExpenses(expenseData);
        hasDataRef.current = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load group";
        setError(message);
        toast(message, "error");
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [group.id, toast]
  );

  useEffect(() => {
    hasDataRef.current = false;
    loadGroupData({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  useEffect(() => {
    const unsubscribe = subscribeToGroup(group.id, () =>
      loadGroupData({ silent: true })
    );
    return unsubscribe;
  }, [group.id, loadGroupData]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteExpense(deleteTarget.id);
      toast(`"${deleteTarget.title}" deleted`, "success");
      setDeleteTarget(null);
      await loadGroupData({ silent: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete expense", "error");
    } finally {
      setDeleting(false);
    }
  }

  function handleDeleteRequest(expense: ExpenseWithDetails) {
    setDeleteTarget({ id: expense.id, title: expense.title });
  }

  function handleEdit(expense: ExpenseWithDetails) {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  }

  function handleAddExpense() {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  }

  function handleExpenseSaved(wasEdit: boolean) {
    toast(wasEdit ? "Expense updated" : "Expense added", "success");
    loadGroupData({ silent: true });
  }

  function handleMemberAdded(name: string) {
    toast(`${name} added to the group`, "success");
    loadGroupData({ silent: true });
  }

  const balances = computeUserBalances(members, expenses);
  const canAddExpense = members.length > 0;

  if (initialLoading) {
    return <GroupViewSkeleton />;
  }

  return (
    <div className="relative flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Group header — hidden subtitle on mobile (shown in top bar) */}
        <header className="mb-5 hidden items-start justify-between gap-4 md:flex">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {group.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
          </div>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Spinner size="sm" />
              Syncing…
            </div>
          )}
        </header>

        {refreshing && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-400 md:hidden">
            <Spinner size="sm" />
            Syncing…
          </div>
        )}

        {error && (
          <Alert variant="error" onDismiss={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-4 pb-24 md:pb-8">
          <SectionCard title="Members">
            <MemberList members={members} />
            <div className="mt-4">
              <AddMemberForm
                groupId={group.id}
                existingMemberIds={members.map((m) => m.user_id)}
                onAdded={handleMemberAdded}
              />
            </div>
          </SectionCard>

          <SettlementSummary balances={balances} />
          <BalanceSummary balances={balances} />

          <SectionCard
            title="Expenses"
            action={
              <Button
                size="sm"
                onClick={handleAddExpense}
                disabled={!canAddExpense}
                className="hidden sm:inline-flex"
              >
                + Add Expense
              </Button>
            }
          >
            {!canAddExpense && (
              <Alert variant="warning" className="mb-4">
                Add at least one member before creating expenses.
              </Alert>
            )}
            <ExpenseTable
              expenses={expenses}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </SectionCard>
        </div>
      </div>

      {/* Mobile FAB */}
      {canAddExpense && (
        <div className="fixed bottom-4 right-4 z-30 sm:hidden safe-bottom">
          <button
            type="button"
            onClick={handleAddExpense}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-light text-white shadow-elevated active:bg-emerald-700"
            aria-label="Add expense"
          >
            +
          </button>
        </div>
      )}

      <ExpenseModal
        key={editingExpense?.id ?? "new"}
        open={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        groupId={group.id}
        members={members}
        expense={editingExpense}
        onSaved={() => handleExpenseSaved(!!editingExpense)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete expense?"
        message={
          deleteTarget
            ? `Remove "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
