import type { UserBalance } from "@/types/database";
import { roundCurrency } from "@/lib/calculations/balances";

export type Settlement = {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
};

/**
 * Greedy debt simplification: minimum transfers to settle all balances.
 */
export function computeSettlements(balances: UserBalance[]): Settlement[] {
  type Person = { id: string; name: string; amount: number };

  const creditors: Person[] = balances
    .filter((b) => b.net_balance > 0.005)
    .map((b) => ({
      id: b.user_id,
      name: b.user_name,
      amount: b.net_balance,
    }))
    .sort((a, b) => b.amount - a.amount);

  const debtors: Person[] = balances
    .filter((b) => b.net_balance < -0.005)
    .map((b) => ({
      id: b.user_id,
      name: b.user_name,
      amount: -b.net_balance,
    }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);

    if (pay > 0.005) {
      settlements.push({
        from_user_id: debtors[i].id,
        from_user_name: debtors[i].name,
        to_user_id: creditors[j].id,
        to_user_name: creditors[j].name,
        amount: roundCurrency(pay),
      });
    }

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
  }

  return settlements;
}
