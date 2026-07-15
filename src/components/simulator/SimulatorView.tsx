"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Fire, Lightning, Sliders } from "@phosphor-icons/react/dist/ssr";
import {
  simulatePayoff,
  formatMonthsAsDuration,
  addMonthsLabel,
  type PayoffInputDebt,
  type PayoffStrategy,
} from "@/lib/payoff";
import { formatMoney } from "@/lib/currency";
import { useSettings } from "@/components/settings/SettingsContext";
import { PayoffChart } from "@/components/PayoffChart";

const MAX_EXTRA = 2000;
const EXTRA_STEP = 25;

export function SimulatorView({ debts }: { debts: PayoffInputDebt[] }) {
  const { defaultStrategy, currency } = useSettings();
  const [strategy, setStrategy] = useState<PayoffStrategy>(defaultStrategy);
  const [extra, setExtra] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const money = (amount: number) => formatMoney(amount, currency);

  const plan = useMemo(
    () => simulatePayoff(debts, strategy, extra, lumpSum),
    [debts, strategy, extra, lumpSum],
  );
  const baseline = useMemo(() => simulatePayoff(debts, strategy, 0, 0), [debts, strategy]);

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
          Simulator
        </h1>
        <p className="mt-1 text-body dark:text-zinc-400">
          See what extra money could do to your debt-free date
        </p>
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <Sliders size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">No debts yet</p>
          <p className="mt-1 text-sm text-body dark:text-zinc-400">
            Add a debt to start simulating what-if scenarios.
          </p>
          <Link
            href="/debts"
            className="mt-5 rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Add a Debt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
        Simulator
      </h1>
      <p className="mt-1 text-body dark:text-zinc-400">
        Drag the slider or add a lump sum and see the effect, instantly
      </p>

      <div className="mt-8 rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
          Strategy
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStrategy("avalanche")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
              strategy === "avalanche"
                ? "border-brand bg-brand-pale dark:bg-zinc-800"
                : "border-ink/15 dark:border-white/20"
            }`}
          >
            <Fire size={20} weight="bold" className="mt-0.5 text-ink-deep dark:text-brand" />
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
                ? "border-brand bg-brand-pale dark:bg-zinc-800"
                : "border-ink/15 dark:border-white/20"
            }`}
          >
            <Lightning size={20} weight="bold" className="mt-0.5 text-ink-deep dark:text-brand" />
            <div>
              <p className="font-bold text-ink dark:text-zinc-50">Snowball</p>
              <p className="mt-0.5 text-sm text-body dark:text-zinc-400">
                Pay smallest balance first. Builds momentum with quick wins.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="extra" className="text-sm font-semibold text-ink dark:text-zinc-50">
              Extra Monthly Payment
            </label>
            <span className="text-lg font-black text-accent-cyan-deep dark:text-sky-400">
              {money(extra)}/mo
            </span>
          </div>
          <input
            id="extra"
            type="range"
            min={0}
            max={MAX_EXTRA}
            step={EXTRA_STEP}
            value={extra}
            onChange={(e) => setExtra(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="lump" className="text-sm font-semibold text-ink dark:text-zinc-50">
            One-Time Lump Sum ({currency})
          </label>
          <input
            id="lump"
            type="number"
            min={0}
            step={50}
            value={lumpSum || ""}
            onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value) || 0))}
            placeholder="e.g. tax refund, bonus"
            className="w-full max-w-xs rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
          />
        </div>
      </div>

      <PayoffChart
        planSeries={plan.balanceSeries}
        baselineSeries={baseline.balanceSeries}
        currency={currency}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-400">Debt-Free In</p>
          <p className="mt-1 text-2xl font-black text-ink dark:text-zinc-50">
            {plan.months !== null ? formatMonthsAsDuration(plan.months) : "50+ years"}
          </p>
          {plan.months !== null && (
            <p className="text-xs text-mute dark:text-zinc-400">{addMonthsLabel(plan.months)}</p>
          )}
        </div>
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-400">Total Interest</p>
          <p className="mt-1 text-2xl font-black text-ink dark:text-zinc-50">
            {money(plan.totalInterest)}
          </p>
        </div>
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-400">Interest Saved</p>
          <p className="mt-1 text-2xl font-black text-positive dark:text-emerald-400">
            {interestSaved !== null ? money(interestSaved) : "—"}
          </p>
          <p className="text-xs text-mute dark:text-zinc-400">vs. minimums only</p>
        </div>
        <div className="rounded-3xl bg-canvas p-5 dark:bg-zinc-900">
          <p className="text-sm text-mute dark:text-zinc-400">Time Saved</p>
          <p className="mt-1 text-2xl font-black text-positive dark:text-emerald-400">
            {timeSavedMonths !== null ? formatMonthsAsDuration(timeSavedMonths) : "—"}
          </p>
          <p className="text-xs text-mute dark:text-zinc-400">vs. minimums only</p>
        </div>
      </div>
    </div>
  );
}
