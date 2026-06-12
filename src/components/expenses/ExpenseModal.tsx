"use client";

import { useEffect, useState } from "react";
import type {
  ExpenseFormData,
  ExpenseWithDetails,
  GroupMemberWithUser,
  ParticipantInput,
} from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createExpense, updateExpense } from "@/lib/services/expenses";
import { roundCurrency } from "@/lib/calculations/balances";

type ExpenseModalProps = {
  open: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMemberWithUser[];
  expense?: ExpenseWithDetails | null;
  onSaved: () => void;
};

type ParticipantState = {
  user_id: string;
  selected: boolean;
  share_amount: string;
  useCustom: boolean;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseModal({
  open,
  onClose,
  groupId,
  members,
  expense,
  onSaved,
}: ExpenseModalProps) {
  const isEditing = !!expense;
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(todayISO());
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setPaidBy(expense.paid_by);
      setDate(expense.date);
      setParticipants(
        members.map((m) => {
          const existing = expense.participants.find(
            (p) => p.user_id === m.user_id
          );
          return {
            user_id: m.user_id,
            selected: !!existing,
            share_amount:
              existing?.share_amount != null
                ? String(existing.share_amount)
                : "",
            useCustom: existing?.share_amount != null,
          };
        })
      );
    } else {
      setTitle("");
      setAmount("");
      setPaidBy(members[0]?.user_id ?? "");
      setDate(todayISO());
      setParticipants(
        members.map((m) => ({
          user_id: m.user_id,
          selected: true,
          share_amount: "",
          useCustom: false,
        }))
      );
    }
    setError(null);
  }, [open, expense, members]);

  function toggleParticipant(userId: string) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.user_id === userId ? { ...p, selected: !p.selected } : p
      )
    );
  }

  function updateParticipantShare(userId: string, share: string) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.user_id === userId ? { ...p, share_amount: share } : p
      )
    );
  }

  function toggleCustomSplit(userId: string) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.user_id === userId
          ? { ...p, useCustom: !p.useCustom, share_amount: "" }
          : p
      )
    );
  }

  function buildFormData(): ExpenseFormData {
    const selected = participants.filter((p) => p.selected);
    const participantInputs: ParticipantInput[] = selected.map((p) => ({
      user_id: p.user_id,
      share_amount: p.useCustom && p.share_amount
        ? roundCurrency(parseFloat(p.share_amount))
        : null,
    }));

    return {
      title: title.trim(),
      amount: roundCurrency(parseFloat(amount)),
      paid_by: paidBy,
      date,
      participants: participantInputs,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedCount = participants.filter((p) => p.selected).length;

    if (!title.trim() || !amount || !paidBy || selectedCount === 0) {
      setError("Fill in all required fields and select at least one participant.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const form = buildFormData();
      if (isEditing && expense) {
        await updateExpense(expense.id, form);
      } else {
        await createExpense(groupId, form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Expense" : "Add Expense"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="expense-title"
          label="Title"
          placeholder="Dinner, groceries, etc."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="expense-amount"
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            id="expense-date"
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="paid-by" className="block text-sm font-medium text-slate-700">
            Paid by
          </label>
          <select
            id="paid-by"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:text-sm"
            required
          >
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Participants</p>
          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            {members.map((m) => {
              const state = participants.find((p) => p.user_id === m.user_id);
              if (!state) return null;

              return (
                <div
                  key={m.user_id}
                  className="flex flex-col gap-2 rounded-xl bg-slate-50 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.selected}
                      onChange={() => toggleParticipant(m.user_id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-800">{m.user.name}</span>
                  </label>

                  {state.selected && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={state.useCustom}
                          onChange={() => toggleCustomSplit(m.user_id)}
                          className="rounded border-slate-300"
                        />
                        Custom
                      </label>
                      {state.useCustom && (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Share"
                          value={state.share_amount}
                          onChange={(e) =>
                            updateParticipantShare(m.user_id, e.target.value)
                          }
                          className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                        />
                      )}
                      {!state.useCustom && (
                        <span className="text-xs text-slate-400">Equal split</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Leave custom unchecked to split equally among selected participants.
          </p>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} fullWidth className="sm:w-auto">
            {loading ? "Saving…" : isEditing ? "Update" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
