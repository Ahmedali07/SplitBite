"use client";

import type { UserBalance } from "@/types/database";
import { formatCurrency } from "@/lib/calculations/balances";
import { computeSettlements } from "@/lib/calculations/settlements";
import { SectionCard } from "@/components/ui/SectionCard";

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
    <SectionCard title="Settle up" variant="highlight">
      {settlements.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            ✓
          </span>
          <p className="text-sm text-emerald-800">
            Everyone is settled — no payments needed.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {settlements.map((s, idx) => (
            <li
              key={`${s.from_user_id}-${s.to_user_id}-${idx}`}
              className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 text-sm shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
            >
              <span className="font-semibold text-slate-800">{s.from_user_name}</span>
              <span className="hidden text-slate-400 sm:inline">pays</span>
              <span className="text-xs text-slate-400 sm:hidden">pays</span>
              <span className="text-base font-bold text-emerald-700 sm:text-sm">
                {formatCurrency(s.amount)}
              </span>
              <span className="hidden text-slate-400 sm:inline">to</span>
              <span className="text-xs text-slate-400 sm:hidden">to</span>
              <span className="font-semibold text-slate-800">{s.to_user_name}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-emerald-700/70">
        Simplified payments to clear all balances.
      </p>
    </SectionCard>
  );
}
