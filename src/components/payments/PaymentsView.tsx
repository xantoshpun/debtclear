"use client";

import { useState } from "react";
import { Plus, Receipt, Trash } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PaymentFormModal } from "./PaymentFormModal";
import type { Debt, Payment } from "./types";

export function PaymentsView({
  initialDebts,
  initialPayments,
}: {
  initialDebts: Debt[];
  initialPayments: Payment[];
}) {
  const supabase = createClient();
  const [debts, setDebts] = useState(initialDebts);
  const [payments, setPayments] = useState(
    [...initialPayments].sort((a, b) => b.payment_date.localeCompare(a.payment_date)),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  function handleSaved(payment: Payment, updatedDebt: Debt) {
    setPayments((cur) =>
      [payment, ...cur].sort((a, b) => b.payment_date.localeCompare(a.payment_date)),
    );
    setDebts((cur) => cur.map((d) => (d.id === updatedDebt.id ? updatedDebt : d)));
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const payment = pendingDelete;

    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id);
    if (deleteError) {
      setPendingDelete(null);
      return;
    }

    const debt = debts.find((d) => d.id === payment.debt_id);
    if (debt) {
      const restoredBalance = Math.min(
        debt.original_balance,
        debt.current_balance + payment.amount,
      );
      const { data: updatedDebt } = await supabase
        .from("debts")
        .update({ current_balance: restoredBalance })
        .eq("id", debt.id)
        .select("id, name, current_balance, original_balance")
        .single();
      if (updatedDebt) {
        setDebts((cur) => cur.map((d) => (d.id === debt.id ? (updatedDebt as Debt) : d)));
      }
    }

    setPayments((cur) => cur.filter((p) => p.id !== payment.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
            Payment History
          </h1>
          <p className="mt-1 text-body dark:text-zinc-400">
            {payments.length} payments · ${totalPaid.toLocaleString()} total paid
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={debts.length === 0}
          className="flex items-center gap-2 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <Plus size={16} weight="bold" />
          Log Payment
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <Receipt size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">
            No payments logged yet.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={debts.length === 0}
            className="mt-5 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            Log First Payment
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-canvas p-4 dark:bg-zinc-900"
            >
              <div>
                <p className="font-semibold text-ink dark:text-zinc-50">
                  {p.debts?.name ?? "Deleted debt"}
                </p>
                <p className="text-sm text-mute dark:text-zinc-500">
                  {new Date(p.payment_date + "T00:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {p.notes ? ` · ${p.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-ink dark:text-zinc-50">
                  ${p.amount.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => setPendingDelete(p)}
                  aria-label="Delete"
                  className="grid size-8 place-items-center rounded-full text-mute hover:bg-negative/10 hover:text-negative dark:text-zinc-500"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <PaymentFormModal
          debts={debts}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete payment"
          message="Delete this payment? The debt's balance will be restored."
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
