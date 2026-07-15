"use client";

import { ChartPieSlice, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Bars } from "@/components/Bars";
import { CashFlowBar } from "@/components/CashFlowBar";
import { useSettings } from "@/components/settings/SettingsContext";

type Debt = {
  id: string;
  name: string;
  debt_type: string;
  original_balance: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  is_paid_off: boolean;
};

type Income = {
  id: string;
  source: string;
  income_type: string;
  monthly_amount: number;
};

type Expense = {
  id: string;
  name: string;
  category: string;
  monthly_amount: number;
};

export type ReportsPayment = {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  debts: { name: string } | null;
};

export function ReportsView({
  debts,
  income,
  expenses,
  payments,
}: {
  debts: Debt[];
  income: Income[];
  expenses: Expense[];
  payments: ReportsPayment[];
}) {
  const { currency } = useSettings();
  const hasAnyData = debts.length > 0 || income.length > 0 || expenses.length > 0;

  const totalIncome = income.reduce((sum, i) => sum + i.monthly_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.monthly_amount, 0);
  const activeDebts = debts.filter((d) => !d.is_paid_off);
  const totalMinPayments = activeDebts.reduce((sum, d) => sum + d.minimum_payment, 0);

  const expensesByCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.monthly_amount;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const debtProgress = debts
    .map((d) => ({
      label: d.name,
      value: d.original_balance ? Math.round(((d.original_balance - d.current_balance) / d.original_balance) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const paymentsByMonth = Object.entries(
    payments.reduce<Record<string, number>>((acc, p) => {
      const key = p.payment_date.slice(0, 7);
      acc[key] = (acc[key] ?? 0) + p.amount;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      const spansMultipleYears =
        new Set(payments.map((p) => p.payment_date.slice(0, 4))).size > 1;
      return {
        label: date.toLocaleDateString(undefined, {
          month: "short",
          year: spansMultipleYears ? "2-digit" : undefined,
        }),
        value,
      };
    });

  function handleExport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      debts,
      income,
      expenses,
      payments: payments.map((p) => ({
        id: p.id,
        debt_id: p.debt_id,
        debt_name: p.debts?.name ?? null,
        amount: p.amount,
        payment_date: p.payment_date,
        notes: p.notes,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debtclear-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
            Reports
          </h1>
          <p className="mt-1 text-body dark:text-zinc-400">
            Where your money goes, and how far you&apos;ve come
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!hasAnyData}
          className="flex items-center gap-2 rounded-3xl bg-canvas-soft px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          <DownloadSimple size={16} weight="bold" />
          Export Data
        </button>
      </div>

      {!hasAnyData ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-canvas py-16 text-center dark:bg-zinc-900">
          <ChartPieSlice size={32} className="text-mute dark:text-zinc-600" />
          <p className="mt-3 font-semibold text-ink dark:text-zinc-50">Nothing to report yet</p>
          <p className="mt-1 text-sm text-body dark:text-zinc-400">
            Add debts, income, or expenses to see your numbers here.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
              Monthly Cash Flow
            </h2>
            <div className="mt-4">
              <CashFlowBar
                income={totalIncome}
                expenses={totalExpenses}
                debtPayments={totalMinPayments}
                currency={currency}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
                Expenses by Category
              </h2>
              {expensesByCategory.length === 0 ? (
                <p className="mt-4 text-sm text-body dark:text-zinc-400">
                  Add expenses to see a breakdown.
                </p>
              ) : (
                <div className="mt-4">
                  <Bars
                    items={expensesByCategory}
                    colorClassName="bg-accent-cyan-deep dark:bg-sky-400"
                    currency={currency}
                  />
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
                Debt Progress
              </h2>
              {debtProgress.length === 0 ? (
                <p className="mt-4 text-sm text-body dark:text-zinc-400">
                  Add a debt to track progress.
                </p>
              ) : (
                <div className="mt-4">
                  <Bars
                    items={debtProgress}
                    colorClassName="bg-warning dark:bg-amber-400"
                    suffix="%"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
              Payments by Month
            </h2>
            {paymentsByMonth.length === 0 ? (
              <p className="mt-4 text-sm text-body dark:text-zinc-400">
                Log a payment to see your history here.
              </p>
            ) : (
              <div className="mt-6">
                <Bars
                  items={paymentsByMonth}
                  colorClassName="bg-positive-deep dark:bg-emerald-400"
                  orientation="vertical"
                  currency={currency}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
