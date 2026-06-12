import type {
  ExpenseWithDetails,
  GroupMemberWithUser,
  UserBalance,
} from "@/types/database";

/**
 * Resolve a participant's share for an expense.
 * Null share_amount → equal split among all participants.
 */
export function getEffectiveShare(
  expense: ExpenseWithDetails,
  userId: string
): number {
  const participant = expense.participants.find((p) => p.user_id === userId);
  if (!participant) return 0;

  if (participant.share_amount !== null) {
    return Number(participant.share_amount);
  }

  const equalSplitCount = expense.participants.filter(
    (p) => p.share_amount === null
  ).length;

  if (equalSplitCount === 0) return 0;
  return expense.amount / equalSplitCount;
}

export function computeUserBalances(
  members: GroupMemberWithUser[],
  expenses: ExpenseWithDetails[]
): UserBalance[] {
  const balances = new Map<string, UserBalance>();

  for (const member of members) {
    balances.set(member.user_id, {
      user_id: member.user_id,
      user_name: member.user.name,
      total_spent: 0,
      total_owed: 0,
      net_balance: 0,
    });
  }

  for (const expense of expenses) {
    const payer = balances.get(expense.paid_by);
    if (payer) {
      payer.total_spent += expense.amount;
    }

    for (const participant of expense.participants) {
      const userBalance = balances.get(participant.user_id);
      if (userBalance) {
        userBalance.total_owed += getEffectiveShare(expense, participant.user_id);
      }
    }
  }

  for (const balance of balances.values()) {
    balance.total_spent = roundCurrency(balance.total_spent);
    balance.total_owed = roundCurrency(balance.total_owed);
    balance.net_balance = roundCurrency(balance.total_spent - balance.total_owed);
  }

  return Array.from(balances.values()).sort((a, b) =>
    a.user_name.localeCompare(b.user_name)
  );
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
