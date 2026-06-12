"use client";

import type { ExpenseWithDetails } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { formatCurrency, getEffectiveShare } from "@/lib/calculations/balances";

type ExpenseTableProps = {
  expenses: ExpenseWithDetails[];
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
};

function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: {
  expense: ExpenseWithDetails;
  onEdit: (e: ExpenseWithDetails) => void;
  onDelete: (e: ExpenseWithDetails) => void;
}) {
  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-slate-900">{expense.title}</h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {new Date(expense.date + "T00:00:00").toLocaleDateString()} · Paid by{" "}
            {expense.paid_by_user?.name ?? "—"}
          </p>
        </div>
        <p className="shrink-0 text-lg font-bold text-slate-900">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {expense.participants.map((p) => (
          <span
            key={p.id}
            className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
          >
            {p.user.name}: {formatCurrency(getEffectiveShare(expense, p.user_id))}
            {p.share_amount === null && " (eq)"}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" fullWidth onClick={() => onEdit(expense)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" fullWidth onClick={() => onDelete(expense)}>
          Delete
        </Button>
      </div>
    </article>
  );
}

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          $
        </div>
        <p className="font-medium text-slate-600">No expenses yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Add your first expense to start tracking splits.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <li key={expense.id}>
            <ExpenseCard expense={expense} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50/80 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Paid by</th>
                <th className="px-4 py-3 font-medium">Split</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(expense.date + "T00:00:00").toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {expense.title}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {expense.paid_by_user?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {expense.participants.map((p) => (
                        <div key={p.id} className="text-xs text-slate-500">
                          {p.user.name}:{" "}
                          {formatCurrency(getEffectiveShare(expense, p.user_id))}
                          {p.share_amount === null && " (equal)"}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(expense)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
