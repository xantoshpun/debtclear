"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import type { Debt, Payment } from "./types";

const inputClass =
  "rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40";
const labelClass = "text-sm font-semibold text-ink dark:text-zinc-50";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentFormModal({
  debts,
  onClose,
  onSaved,
}: {
  debts: Debt[];
  onClose: () => void;
  onSaved: (payment: Payment, updatedDebt: Debt) => void;
}) {
  const supabase = createClient();

  const [debtId, setDebtId] = useState(debts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!debtId || !amount) {
      setError("Fill in all required fields.");
      return;
    }
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) {
      setError("Select a debt.");
      return;
    }
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        account_id: user!.id,
        debt_id: debtId,
        amount: Number(amount),
        payment_date: paymentDate,
        notes: notes.trim() || null,
      })
      .select("id, debt_id, amount, payment_date, notes, debts(name)")
      .single();

    if (paymentError || !payment) {
      setLoading(false);
      setError(paymentError?.message ?? "Couldn't log that payment.");
      return;
    }

    const newBalance = Math.max(0, debt.current_balance - Number(amount));
    const { data: updatedDebt, error: debtError } = await supabase
      .from("debts")
      .update({ current_balance: newBalance })
      .eq("id", debtId)
      .select("id, name, current_balance, original_balance")
      .single();

    setLoading(false);
    if (debtError || !updatedDebt) {
      setError(debtError?.message ?? "Payment logged, but couldn't update the balance.");
      return;
    }

    onSaved(payment as unknown as Payment, updatedDebt as Debt);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8 dark:bg-black/60">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-ink dark:text-zinc-50">
            Log Payment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-mute hover:bg-ink/5 dark:text-zinc-500 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="debt" className={labelClass}>
              Debt
            </label>
            <select
              id="debt"
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select debt...
              </option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (${d.current_balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className={labelClass}>
              Amount ($)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="date" className={labelClass}>
              Payment Date
            </label>
            <input
              id="date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-3xl px-5 py-3 text-sm font-semibold text-body hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || debts.length === 0}
              className="flex-1 rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Saving..." : "Log Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
