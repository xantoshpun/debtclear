"use client";

import { useState } from "react";
import { Plus, CurrencyDollar, PencilSimple, Trash, Briefcase } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IncomeFormModal } from "./IncomeFormModal";
import type { Income, Profile } from "./types";
import { formatMoney } from "@/lib/currency";
import { useSettings } from "@/components/settings/SettingsContext";

export function IncomeView({
  profiles,
  initialIncome,
}: {
  profiles: Profile[];
  initialIncome: Income[];
}) {
  const supabase = createClient();
  const { currency } = useSettings();
  const [income, setIncome] = useState(initialIncome);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Income | null>(null);

  const combined = income.reduce((sum, i) => sum + i.monthly_amount, 0);

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(i: Income) {
    setEditing(i);
    setModalOpen(true);
  }

  function handleSaved(saved: Income) {
    setIncome((cur) => {
      const exists = cur.some((i) => i.id === saved.id);
      return exists ? cur.map((i) => (i.id === saved.id ? saved : i)) : [...cur, saved];
    });
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("income").delete().eq("id", pendingDelete.id);
    if (!error) setIncome((cur) => cur.filter((x) => x.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
            Income
          </h1>
          <p className="mt-1 text-body dark:text-zinc-400">
            {formatMoney(combined, currency)}/mo combined
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={profiles.length === 0}
          className="flex items-center gap-2 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <Plus size={16} weight="bold" />
          Add Income
        </button>
      </div>

      {profiles.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => {
            const total = income
              .filter((i) => i.profile_id === p.id)
              .reduce((sum, i) => sum + i.monthly_amount, 0);
            return (
              <div key={p.id} className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
                <p className="text-sm font-semibold text-mute dark:text-zinc-400">{p.name}</p>
                <p className="mt-1 text-2xl font-black text-ink dark:text-zinc-50">
                  {formatMoney(total, currency)}
                  <span className="text-base font-semibold text-mute dark:text-zinc-400">/mo</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {income.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <CurrencyDollar size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">
            No income sources added yet
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-5 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Add Income
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {income.map((i) => {
            const owner = profiles.find((p) => p.id === i.profile_id);
            return (
              <div
                key={i.id}
                className="flex items-center justify-between gap-4 rounded-3xl bg-canvas p-5 shadow-[0_1px_0_rgba(16,20,15,0.06)] dark:bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-positive/10 dark:bg-zinc-800">
                    <Briefcase size={18} weight="bold" className="text-positive dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-ink dark:text-zinc-50">{i.source}</p>
                    <p className="text-sm text-mute dark:text-zinc-400">
                      {i.job_title ? `${i.job_title} · ` : ""}
                      {i.income_type}
                      {owner ? ` · ${owner.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-ink dark:text-zinc-50">
                    {formatMoney(i.monthly_amount, currency)}
                    <span className="text-sm font-medium text-mute dark:text-zinc-400">/mo</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => openEdit(i)}
                    aria-label="Edit"
                    className="grid size-11 place-items-center rounded-full text-mute hover:bg-ink/5 hover:text-ink dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(i)}
                    aria-label="Delete"
                    className="grid size-11 place-items-center rounded-full text-mute hover:bg-negative/10 hover:text-negative dark:text-zinc-400"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <IncomeFormModal
          profiles={profiles}
          income={editing}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete income"
          message={`Delete "${pendingDelete.source}"? This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
