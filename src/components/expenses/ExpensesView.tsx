"use client";

import { useState } from "react";
import {
  Plus,
  Receipt,
  PencilSimple,
  Trash,
  House,
  ForkKnife,
  Car,
  Lightning,
  FilmSlate,
  TShirt,
  ArrowsClockwise,
  DotsThreeCircle,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExpenseFormModal } from "./ExpenseFormModal";
import type { Expense, ExpenseCategory, Profile } from "./types";
import { formatMoney } from "@/lib/currency";
import { useSettings } from "@/components/settings/SettingsContext";

const CATEGORY_ICONS: Record<ExpenseCategory, typeof House> = {
  Housing: House,
  Food: ForkKnife,
  Transportation: Car,
  Utilities: Lightning,
  Entertainment: FilmSlate,
  Clothing: TShirt,
  Subscriptions: ArrowsClockwise,
  Other: DotsThreeCircle,
};

export function ExpensesView({
  profiles,
  initialExpenses,
}: {
  profiles: Profile[];
  initialExpenses: Expense[];
}) {
  const supabase = createClient();
  const { currency } = useSettings();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const total = expenses.reduce((sum, e) => sum + e.monthly_amount, 0);

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setModalOpen(true);
  }

  function handleSaved(saved: Expense) {
    setExpenses((cur) => {
      const exists = cur.some((e) => e.id === saved.id);
      return exists ? cur.map((e) => (e.id === saved.id ? saved : e)) : [...cur, saved];
    });
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("expenses").delete().eq("id", pendingDelete.id);
    if (!error) setExpenses((cur) => cur.filter((x) => x.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function ownerLabel(profileId: string | null) {
    if (!profileId) return "Joint";
    return profiles.find((p) => p.id === profileId)?.name ?? "Joint";
  }

  const categories = Array.from(new Set(expenses.map((e) => e.category))).map((cat) => ({
    category: cat,
    items: expenses.filter((e) => e.category === cat),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
            Expenses
          </h1>
          <p className="mt-1 text-body dark:text-zinc-400">
            {formatMoney(total, currency)}/mo total
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Add Expense
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <Receipt size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">
            No expenses added yet
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-5 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Add Expense
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {categories.map(({ category, items }) => {
            const Icon = CATEGORY_ICONS[category];
            const subtotal = items.reduce((sum, e) => sum + e.monthly_amount, 0);
            return (
              <div key={category}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} weight="bold" className="text-accent-cyan-deep dark:text-sky-400" />
                    <h2 className="font-bold text-ink dark:text-zinc-50">{category}</h2>
                  </div>
                  <span className="text-sm text-mute dark:text-zinc-400">
                    {formatMoney(subtotal, currency)}/mo
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {items.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-canvas p-4 dark:bg-zinc-900"
                    >
                      <div>
                        <p className="font-semibold text-ink dark:text-zinc-50">{e.name}</p>
                        <p className="text-sm text-mute dark:text-zinc-400">
                          {ownerLabel(e.profile_id)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-ink dark:text-zinc-50">
                          {formatMoney(e.monthly_amount, currency)}
                          <span className="text-sm font-medium text-mute dark:text-zinc-400">
                            /mo
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          aria-label="Edit"
                          className="grid size-11 place-items-center rounded-full text-mute hover:bg-ink/5 hover:text-ink dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(e)}
                          aria-label="Delete"
                          className="grid size-11 place-items-center rounded-full text-mute hover:bg-negative/10 hover:text-negative dark:text-zinc-400"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ExpenseFormModal
          profiles={profiles}
          expense={editing}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete expense"
          message={`Delete "${pendingDelete.name}"? This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
