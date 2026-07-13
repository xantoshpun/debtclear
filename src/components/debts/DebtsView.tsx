"use client";

import { useState } from "react";
import { Plus, CreditCard } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DebtCard } from "./DebtCard";
import { DebtFormModal } from "./DebtFormModal";
import type { Debt, Profile } from "./types";

export function DebtsView({
  profiles,
  initialDebts,
}: {
  profiles: Profile[];
  initialDebts: Debt[];
}) {
  const supabase = createClient();
  const [debts, setDebts] = useState(initialDebts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Debt | null>(null);

  const active = debts.filter((d) => !d.is_paid_off).length;
  const paidOff = debts.filter((d) => d.is_paid_off).length;

  function openAdd() {
    setEditingDebt(undefined);
    setModalOpen(true);
  }

  function openEdit(debt: Debt) {
    setEditingDebt(debt);
    setModalOpen(true);
  }

  function handleSaved(saved: Debt) {
    setDebts((cur) => {
      const exists = cur.some((d) => d.id === saved.id);
      return exists ? cur.map((d) => (d.id === saved.id ? saved : d)) : [...cur, saved];
    });
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("debts").delete().eq("id", pendingDelete.id);
    if (!error) setDebts((cur) => cur.filter((d) => d.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  async function handleTogglePaid(debt: Debt) {
    const { data, error } = await supabase
      .from("debts")
      .update({ is_paid_off: !debt.is_paid_off })
      .eq("id", debt.id)
      .select()
      .single();
    if (!error && data) {
      setDebts((cur) => cur.map((d) => (d.id === debt.id ? (data as Debt) : d)));
    }
  }

  const groups: { key: string; label: string; items: Debt[] }[] = [
    ...profiles.map((p) => ({
      key: p.id,
      label: p.name,
      items: debts.filter((d) => d.profile_id === p.id),
    })),
    { key: "joint", label: "Joint", items: debts.filter((d) => d.profile_id === null) },
  ].filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
            Debts
          </h1>
          <p className="mt-1 text-body dark:text-zinc-400">
            {active} active · {paidOff} paid off
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Add Debt
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <CreditCard size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">No debts yet</p>
          <p className="mt-1 text-sm text-body dark:text-zinc-400">
            Add your first one to start building a payoff plan.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-5 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Add Debt
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {groups.map((group) => {
            const total = group.items.reduce((sum, d) => sum + d.current_balance, 0);
            return (
              <div key={group.key}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-bold text-ink dark:text-zinc-50">
                    {group.label}
                  </h2>
                  <span className="text-sm text-mute dark:text-zinc-500">
                    ${total.toLocaleString()} total
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onEdit={() => openEdit(debt)}
                      onDelete={() => setPendingDelete(debt)}
                      onTogglePaid={() => handleTogglePaid(debt)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <DebtFormModal
          profiles={profiles}
          debt={editingDebt}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete debt"
          message={`Delete "${pendingDelete.name}"? This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
