"use client";

import { PencilSimple, Trash, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Debt } from "./types";

export function DebtCard({
  debt,
  onEdit,
  onDelete,
  onTogglePaid,
}: {
  debt: Debt;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaid: () => void;
}) {
  const percentPaid = debt.original_balance
    ? Math.max(
        0,
        Math.min(100, Math.round(((debt.original_balance - debt.current_balance) / debt.original_balance) * 100)),
      )
    : 0;

  return (
    <div className="rounded-3xl bg-canvas p-5 shadow-[0_1px_0_rgba(16,20,15,0.06)] dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-ink dark:text-zinc-50">{debt.name}</p>
          <p className="text-sm text-mute dark:text-zinc-500">{debt.debt_type}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="grid size-8 place-items-center rounded-full text-mute hover:bg-ink/5 hover:text-ink dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-50"
          >
            <PencilSimple size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="grid size-8 place-items-center rounded-full text-mute hover:bg-negative/10 hover:text-negative dark:text-zinc-500"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-mute dark:text-zinc-500">Balance</p>
          <p className="font-semibold text-ink dark:text-zinc-50">
            ${debt.current_balance.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-mute dark:text-zinc-500">Interest Rate</p>
          <p className="font-semibold text-ink dark:text-zinc-50">{debt.interest_rate}%</p>
        </div>
        <div>
          <p className="text-mute dark:text-zinc-500">Min. Payment</p>
          <p className="font-semibold text-ink dark:text-zinc-50">
            ${debt.minimum_payment.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-mute dark:text-zinc-500">Due Day</p>
          <p className="font-semibold text-ink dark:text-zinc-50">
            {debt.due_day ? `Day ${debt.due_day}` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-mute dark:text-zinc-500">
        <span>{percentPaid}% paid</span>
        <span>${debt.original_balance.toLocaleString()} original</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft dark:bg-zinc-800">
        <div className="h-full rounded-full bg-brand" style={{ width: `${percentPaid}%` }} />
      </div>

      <button
        type="button"
        onClick={onTogglePaid}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition-colors ${
          debt.is_paid_off
            ? "border-positive/30 bg-brand-pale text-positive dark:bg-zinc-800 dark:text-emerald-400"
            : "border-ink/15 text-body hover:bg-ink/5 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/10"
        }`}
      >
        <CheckCircle size={16} weight={debt.is_paid_off ? "fill" : "regular"} />
        {debt.is_paid_off ? "Paid Off" : "Mark as Paid Off"}
      </button>
    </div>
  );
}
