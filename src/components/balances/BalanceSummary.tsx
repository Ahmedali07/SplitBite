"use client";

import type { UserBalance } from "@/types/database";
import { formatCurrency } from "@/lib/calculations/balances";

type BalanceSummaryProps = {
  balances: UserBalance[];
};

export function BalanceSummary({ balances }: BalanceSummaryProps) {
  if (balances.length === 0) return null;

  const totalExpenses = balances.reduce((sum, b) => sum + b.total_spent, 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Balances
        </h3>
        {totalExpenses > 0 && (
          <span className="text-xs text-slate-400">
            {formatCurrency(totalExpenses)} total spent
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="pb-2 pr-4 font-medium">Member</th>
              <th className="pb-2 pr-4 font-medium">Paid</th>
              <th className="pb-2 pr-4 font-medium">Owes</th>
              <th className="pb-2 font-medium">Net</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance) => (
              <tr key={balance.user_id} className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-800">
                  {balance.user_name}
                </td>
                <td className="py-2 pr-4 text-slate-600">
                  {formatCurrency(balance.total_spent)}
                </td>
                <td className="py-2 pr-4 text-slate-600">
                  {formatCurrency(balance.total_owed)}
                </td>
                <td
                  className={`py-2 font-medium ${
                    balance.net_balance > 0
                      ? "text-emerald-600"
                      : balance.net_balance < 0
                        ? "text-red-600"
                        : "text-slate-600"
                  }`}
                >
                  {balance.net_balance > 0 ? "+" : ""}
                  {formatCurrency(balance.net_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Positive net = others owe them. Negative net = they owe others.
      </p>
    </section>
  );
}
