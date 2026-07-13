"use client";

import { useMemo, useState } from "react";
import { Fire, Lightning, ChartLineUp, Target } from "@phosphor-icons/react/dist/ssr";
import {
  simulatePayoff,
  formatMonthsAsDuration,
  addMonthsLabel,
  type PayoffInputDebt,
  type PayoffStrategy,
} from "@/lib/payoff";

export function PayoffPlanView({ debts }: { debts: PayoffInputDebt[] }) {
  const [strategy, setStrategy] = useState<PayoffStrategy>("avalanche");
  const [extra, setExtra] = useState(0);

  const plan = useMemo(() => simulatePayoff(debts, strategy, extra), [debts, strategy, extra]);
  const baseline = useMemo(() => simulatePayoff(debts, strategy, 0), [debts, strategy]);

  const interestSaved =
    plan.months !== null && baseline.months !== null
      ? Math.max(0, baseline.totalInterest - plan.totalInterest)
      : null;
  const timeSavedMonths =
    plan.months !== null && baseline.months !== null
      ? Math.max(0, baseline.months - plan.months)
      : null;

  if (debts.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
          Payoff Plan
        </h1>
        <p className="mt-1 text-body dark:text-zinc-400">
          Your step-by-step strategy to become debt-free
        </p>
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <ChartLineUp size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">No debts yet</p>
          <p className="mt-1 text-sm text-body dark:text-zinc-400">
            Add a debt to see your payoff plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
        Payoff Plan
      </h1>
      <p className="mt-1 text-body dark:text-zinc-400">
        Your step-by-step strategy to become debt-free
      </p>

      <div className="mt-8 rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-mute dark:text-zinc-500">
          Choose Your Strategy
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStrategy("avalanche")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
              strategy === "avalanche"
                ? "border-brand bg-brand-pale"
                : "border-ink/15 dark:border-white/20"
            }`}
          >
            <Fire size={20} weight="bold" className="mt-0.5 text-ink" />
            <div>
              <p className="font-bold text-ink dark:text-zinc-50">Avalanche</p>
              <p className="mt-0.5 text-sm text-body dark:text-zinc-400">
                Pay highest interest rate first. Minimizes total interest paid.
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStrategy("snowball")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
              strategy === "snowball"
                ? "border-brand bg-brand-pale"
                : "border-ink/15 dark:border-white/20"
            }`}
          >
            <Lightning size={20} weight="bold" className="mt-0.5 text-ink" />
            <div>
              <p className="font-bold text-ink dark:text-zinc-50">Snowball</p>
              <p className="mt-0.5 text-sm text-body dark:text-zinc-400">
                Pay smallest balance first. Builds momentum with quick wins.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor="extra" className="text-sm font-semibold text-ink dark:text-zinc-50">
            Extra Monthly Payment ($)
          </label>
          <input
            id="extra"
            type="number"
            min="0"
            step="1"
            value={extra}
            onChange={(e) => setExtra(Math.max(0, Number(e.target.value) || 0))}
            className="w-full max-w-xs rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-500">Debt-Free In</p>
          <p className="mt-1 text-2xl font-black text-ink dark:text-zinc-50">
            {plan.months !== null ? formatMonthsAsDuration(plan.months) : "50+ years"}
          </p>
          {plan.months !== null && (
            <p className="text-xs text-mute dark:text-zinc-500">
              {addMonthsLabel(plan.months)}
            </p>
          )}
        </div>
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-500">Total Interest</p>
          <p className="mt-1 text-2xl font-black text-ink dark:text-zinc-50">
            ${Math.round(plan.totalInterest).toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-500">Interest Saved</p>
          <p className="mt-1 text-2xl font-black text-positive dark:text-emerald-400">
            {interestSaved !== null ? `$${Math.round(interestSaved).toLocaleString()}` : "—"}
          </p>
          <p className="text-xs text-mute dark:text-zinc-500">vs. minimums only</p>
        </div>
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-500">Time Saved</p>
          <p className="mt-1 text-2xl font-black text-positive dark:text-emerald-400">
            {timeSavedMonths !== null ? formatMonthsAsDuration(timeSavedMonths) : "—"}
          </p>
          <p className="text-xs text-mute dark:text-zinc-500">vs. minimums only</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-ink dark:text-zinc-50">
          Your Payoff Action Plan
        </h2>
        <p className="mt-1 text-sm text-body dark:text-zinc-400">
          Focus all extra money on the highest-priority debt first. Pay minimums on
          everything else.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {plan.order.map((debt, i) => (
            <div
              key={debt.id}
              className={`rounded-2xl border p-4 ${
                i === 0
                  ? "border-brand bg-brand-pale"
                  : "border-ink/10 dark:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white dark:bg-zinc-50 dark:text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-ink dark:text-zinc-50">{debt.name}</p>
                    <p className="text-sm text-mute dark:text-zinc-500">
                      ${debt.balance.toLocaleString()} at {debt.interestRate}% APR
                    </p>
                  </div>
                </div>
                {i === 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-ink">
                    <Target size={12} weight="bold" />
                    Focus here now
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-body dark:text-zinc-400">
                <span>Min. Payment ${debt.minimumPayment.toLocaleString()}/mo</span>
                <span>
                  {debt.monthsToPayoff !== null
                    ? `Paid off in ~${formatMonthsAsDuration(debt.monthsToPayoff)} (${addMonthsLabel(debt.monthsToPayoff)})`
                    : "Not paid off within 50 years at this rate"}
                </span>
                {i === 0 && extra > 0 && (
                  <span className="font-semibold text-ink dark:text-zinc-50">
                    Pay ${(debt.minimumPayment + extra).toLocaleString()}/mo (min + ${extra.toLocaleString()} extra)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
