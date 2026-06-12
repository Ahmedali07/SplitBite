"use client";

import type { UserBalance } from "@/types/database";
import { formatCurrency } from "@/lib/calculations/balances";
import { computeSettlements } from "@/lib/calculations/settlements";

type SettlementSummaryProps = {
  balances: UserBalance[];
};

export function SettlementSummary({ balances }: SettlementSummaryProps) {
  const settlements = computeSettlements(balances);
  const hasExpenses = balances.some(
    (b) => b.total_spent > 0 || b.total_owed > 0
  );

  if (!hasExpenses) return null;

  return (
    <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
        Settle up
      </h3>

      {settlements.length === 0 ? (
        <p className="text-sm text-emerald-700">
          Everyone is settled — no payments needed.
        </p>
      ) : (
        <ul className="space-y-2">
          {settlements.map((s, idx) => (
            <li
              key={`${s.from_user_id}-${s.to_user_id}-${idx}`}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
            >
              <span className="font-medium text-slate-800">{s.from_user_name}</span>
              <span className="text-slate-400">pays</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(s.amount)}
              </span>
              <span className="text-slate-400">to</span>
              <span className="font-medium text-slate-800">{s.to_user_name}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-emerald-600/80">
        Simplified payments to clear all balances.
      </p>
    </section>
  );
}
