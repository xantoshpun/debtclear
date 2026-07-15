"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/Modal";
import { useSettings } from "@/components/settings/SettingsContext";
import { DEBT_TYPES, type Debt, type Profile } from "./types";

const inputClass =
  "rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40";
const labelClass = "text-sm font-semibold text-ink dark:text-zinc-50";

export function DebtFormModal({
  profiles,
  debt,
  onClose,
  onSaved,
}: {
  profiles: Profile[];
  debt?: Debt;
  onClose: () => void;
  onSaved: (debt: Debt) => void;
}) {
  const supabase = createClient();
  const { currency } = useSettings();
  const isEdit = !!debt;

  const [name, setName] = useState(debt?.name ?? "");
  const [debtType, setDebtType] = useState<string>(debt?.debt_type ?? "");
  const [profileId, setProfileId] = useState<string>(
    debt?.profile_id ?? profiles[0]?.id ?? "",
  );
  const [originalBalance, setOriginalBalance] = useState(
    debt ? String(debt.original_balance) : "",
  );
  const [currentBalance, setCurrentBalance] = useState(
    debt ? String(debt.current_balance) : "",
  );
  const [interestRate, setInterestRate] = useState(
    debt ? String(debt.interest_rate) : "",
  );
  const [minimumPayment, setMinimumPayment] = useState(
    debt ? String(debt.minimum_payment) : "",
  );
  const [dueDay, setDueDay] = useState(debt?.due_day ? String(debt.due_day) : "");
  const [notes, setNotes] = useState(debt?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !debtType || !originalBalance || !currentBalance || !interestRate || !minimumPayment) {
      setError("Fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const row = {
      account_id: user!.id,
      profile_id: profileId || null,
      name: name.trim(),
      debt_type: debtType,
      original_balance: Number(originalBalance),
      current_balance: Number(currentBalance),
      interest_rate: Number(interestRate),
      minimum_payment: Number(minimumPayment),
      due_day: dueDay ? Number(dueDay) : null,
      notes: notes.trim() || null,
    };

    const query = isEdit
      ? supabase.from("debts").update(row).eq("id", debt!.id).select().single()
      : supabase.from("debts").insert(row).select().single();

    const { data, error } = await query;
    setLoading(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't save that debt.");
      return;
    }
    onSaved(data as Debt);
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-ink dark:text-zinc-50">
          {isEdit ? "Edit Debt" : "Add Debt"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-11 place-items-center rounded-full text-mute hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={labelClass}>
            Debt Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chase Visa"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select
              id="type"
              value={debtType}
              onChange={(e) => setDebtType(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select type
              </option>
              {DEBT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="owner" className={labelClass}>
              Owner
            </label>
            <select
              id="owner"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className={inputClass}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              {profiles.length > 1 && <option value="">Joint</option>}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="original" className={labelClass}>
              Original Balance ({currency})
            </label>
            <input
              id="original"
              type="number"
              step="0.01"
              min="0"
              value={originalBalance}
              onChange={(e) => setOriginalBalance(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="current" className={labelClass}>
              Current Balance ({currency})
            </label>
            <input
              id="current"
              type="number"
              step="0.01"
              min="0"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="rate" className={labelClass}>
              Interest Rate (%)
            </label>
            <input
              id="rate"
              type="number"
              step="0.001"
              min="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="min-payment" className={labelClass}>
              Minimum Payment ({currency})
            </label>
            <input
              id="min-payment"
              type="number"
              step="0.01"
              min="0"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="due-day" className={labelClass}>
            Due Date (Day of Month)
          </label>
          <input
            id="due-day"
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
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
            placeholder="Any additional notes..."
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
            disabled={loading}
            className="flex-1 rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Debt"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
