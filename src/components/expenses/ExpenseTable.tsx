"use client";

import type { ExpenseWithDetails } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { formatCurrency, getEffectiveShare } from "@/lib/calculations/balances";

type ExpenseTableProps = {
  expenses: ExpenseWithDetails[];
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-600">No expenses yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Add your first expense to start tracking splits.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
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
                <td className="px-4 py-3 text-slate-800">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(expense)}
                    >
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
  );
}
