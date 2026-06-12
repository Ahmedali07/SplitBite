"use client";

import type { UserBalance } from "@/types/database";
import { formatCurrency } from "@/lib/calculations/balances";
import { SectionCard } from "@/components/ui/SectionCard";

type BalanceSummaryProps = {
  balances: UserBalance[];
};

function NetBadge({ value }: { value: number }) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold ${
        positive
          ? "bg-emerald-100 text-emerald-700"
          : negative
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      {positive ? "+" : ""}
      {formatCurrency(value)}
    </span>
  );
}

export function BalanceSummary({ balances }: BalanceSummaryProps) {
  if (balances.length === 0) return null;

  const totalExpenses = balances.reduce((sum, b) => sum + b.total_spent, 0);

  return (
    <SectionCard
      title="Balances"
      subtitle={
        totalExpenses > 0
          ? `${formatCurrency(totalExpenses)} total spent`
          : undefined
      }
    >
      {/* Mobile: card list */}
      <ul className="space-y-3 md:hidden">
        {balances.map((balance) => (
          <li
            key={balance.user_id}
            className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-800">{balance.user_name}</span>
              <NetBadge value={balance.net_balance} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <span className="block text-slate-400">Paid</span>
                {formatCurrency(balance.total_spent)}
              </div>
              <div>
                <span className="block text-slate-400">Owes</span>
                {formatCurrency(balance.total_owed)}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
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
                <td className="py-3 pr-4 font-medium text-slate-800">
                  {balance.user_name}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {formatCurrency(balance.total_spent)}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {formatCurrency(balance.total_owed)}
                </td>
                <td className="py-3">
                  <NetBadge value={balance.net_balance} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Positive net = others owe them. Negative net = they owe others.
      </p>
    </SectionCard>
  );
}
