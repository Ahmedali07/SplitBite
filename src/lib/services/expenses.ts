import { supabase } from "@/lib/supabaseClient";
import { getUsersByIds } from "@/lib/services/users";
import type {
  ExpenseFormData,
  ExpenseParticipant,
  ExpenseWithDetails,
  ParticipantInput,
  User,
} from "@/types/database";

function attachUsersToParticipants(
  participants: ExpenseParticipant[],
  userMap: Map<string, User>
): ExpenseWithDetails["participants"] {
  return participants.map((p) => ({
    ...p,
    user: userMap.get(p.user_id)!,
  }));
}

async function fetchExpensesWithDetails(
  groupId: string
): Promise<ExpenseWithDetails[]> {
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*")
    .eq("group_id", groupId)
    .order("date", { ascending: true });

  if (expensesError) throw new Error(expensesError.message);
  if (!expenses?.length) return [];

  const expenseIds = expenses.map((e) => e.id);

  const { data: participants, error: participantsError } = await supabase
    .from("expense_participants")
    .select("*")
    .in("expense_id", expenseIds);

  if (participantsError) throw new Error(participantsError.message);

  const userIds = [
    ...new Set([
      ...expenses.map((e) => e.paid_by),
      ...(participants ?? []).map((p) => p.user_id),
    ]),
  ];
  const users = await getUsersByIds(userIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  const participantsByExpense = new Map<string, ExpenseWithDetails["participants"]>();

  for (const p of participants ?? []) {
    const list = participantsByExpense.get(p.expense_id) ?? [];
    list.push({ ...p, user: userMap.get(p.user_id)! });
    participantsByExpense.set(p.expense_id, list);
  }

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
    paid_by_user: userMap.get(expense.paid_by)!,
    participants: participantsByExpense.get(expense.id) ?? [],
  }));
}

export async function listExpenses(groupId: string): Promise<ExpenseWithDetails[]> {
  return fetchExpensesWithDetails(groupId);
}

export async function getExpenseById(
  expenseId: string
): Promise<ExpenseWithDetails | null> {
  const { data: expense, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (error || !expense) return null;

  const { data: participants } = await supabase
    .from("expense_participants")
    .select("*")
    .eq("expense_id", expenseId);

  const userIds = [
    expense.paid_by,
    ...(participants ?? []).map((p) => p.user_id),
  ];
  const users = await getUsersByIds(userIds);
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    ...expense,
    amount: Number(expense.amount),
    paid_by_user: userMap.get(expense.paid_by)!,
    participants: attachUsersToParticipants(participants ?? [], userMap),
  };
}

async function saveParticipants(
  expenseId: string,
  participants: ParticipantInput[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("expense_participants")
    .delete()
    .eq("expense_id", expenseId);

  if (deleteError) throw new Error(deleteError.message);

  if (participants.length === 0) return;

  const rows = participants.map((p) => ({
    expense_id: expenseId,
    user_id: p.user_id,
    share_amount: p.share_amount ?? null,
  }));

  const { error: insertError } = await supabase
    .from("expense_participants")
    .insert(rows);

  if (insertError) throw new Error(insertError.message);
}

export async function createExpense(
  groupId: string,
  form: ExpenseFormData
): Promise<void> {
  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      group_id: groupId,
      title: form.title,
      amount: form.amount,
      paid_by: form.paid_by,
      date: form.date,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await saveParticipants(expense.id, form.participants);
}

export async function updateExpense(
  expenseId: string,
  form: ExpenseFormData
): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .update({
      title: form.title,
      amount: form.amount,
      paid_by: form.paid_by,
      date: form.date,
    })
    .eq("id", expenseId);

  if (error) throw new Error(error.message);
  await saveParticipants(expenseId, form.participants);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) throw new Error(error.message);
}
