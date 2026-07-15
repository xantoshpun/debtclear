"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/Modal";
import { useSettings } from "@/components/settings/SettingsContext";
import { EXPENSE_CATEGORIES, type Expense, type Profile } from "./types";

const inputClass =
  "rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40";
const labelClass = "text-sm font-semibold text-ink dark:text-zinc-50";

export function ExpenseFormModal({
  profiles,
  expense,
  onClose,
  onSaved,
}: {
  profiles: Profile[];
  expense?: Expense;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}) {
  const supabase = createClient();
  const { currency } = useSettings();
  const isEdit = !!expense;

  const [name, setName] = useState(expense?.name ?? "");
  const [category, setCategory] = useState<string>(expense?.category ?? "");
  const [profileId, setProfileId] = useState(
    expense?.profile_id ?? profiles[0]?.id ?? "",
  );
  const [monthlyAmount, setMonthlyAmount] = useState(
    expense ? String(expense.monthly_amount) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !category || !monthlyAmount) {
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
      category,
      monthly_amount: Number(monthlyAmount),
    };

    const query = isEdit
      ? supabase.from("expenses").update(row).eq("id", expense!.id).select().single()
      : supabase.from("expenses").insert(row).select().single();

    const { data, error } = await query;
    setLoading(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't save that expense.");
      return;
    }
    onSaved(data as Expense);
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-ink dark:text-zinc-50">
          {isEdit ? "Edit Expense" : "Add Expense"}
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
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. House Rent"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select category
              </option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
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

        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className={labelClass}>
            Monthly Amount ({currency})
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
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
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
