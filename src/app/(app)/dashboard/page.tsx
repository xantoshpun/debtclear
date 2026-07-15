import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  CurrencyDollar,
  Receipt,
  ChartLineUp,
  ChartBar,
  Sliders,
  ChartPieSlice,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/currency";
import { simulatePayoff, type PayoffStrategy } from "@/lib/payoff";
import { PayoffChart } from "@/components/PayoffChart";
import { CashFlowBar } from "@/components/CashFlowBar";
import { Bars } from "@/components/Bars";

export const metadata: Metadata = {
  title: "Dashboard: DebtClear",
};

const QUICK_ACTIONS = [
  { label: "Add a Debt", icon: CreditCard, href: "/debts", tint: "text-warning dark:text-amber-400" },
  { label: "Add Income", icon: CurrencyDollar, href: "/income", tint: "text-positive dark:text-emerald-400" },
  { label: "Add Expense", icon: Receipt, href: "/expenses", tint: "text-accent-cyan-deep dark:text-sky-400" },
  { label: "Log a Payment", icon: ChartBar, href: "/payments", tint: "text-positive-deep dark:text-emerald-400" },
  { label: "View Payoff Plan", icon: ChartLineUp, href: "/payoff-plan", tint: "text-ink-deep dark:text-brand" },
  { label: "Try the Simulator", icon: Sliders, href: "/simulator", tint: "text-accent-cyan-deep dark:text-sky-400" },
  { label: "View Reports", icon: ChartPieSlice, href: "/reports", tint: "" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: debts }, { data: income }, { data: expenses }, { data: settingsRow }] =
    await Promise.all([
      supabase
        .from("debts")
        .select("id, name, debt_type, current_balance, interest_rate, minimum_payment, is_paid_off")
        .eq("account_id", user.id),
      supabase.from("income").select("monthly_amount").eq("account_id", user.id),
      supabase.from("expenses").select("monthly_amount").eq("account_id", user.id),
      supabase
        .from("settings")
        .select("currency, default_strategy")
        .eq("account_id", user.id)
        .maybeSingle(),
    ]);

  const currency = settingsRow?.currency ?? "USD";
  const strategy: PayoffStrategy = (settingsRow?.default_strategy as PayoffStrategy) ?? "avalanche";
  const activeDebts = (debts ?? []).filter((d) => !d.is_paid_off);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const minPayments = activeDebts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const monthlyIncome = (income ?? []).reduce((sum, i) => sum + i.monthly_amount, 0);
  const monthlyExpenses = (expenses ?? []).reduce((sum, e) => sum + e.monthly_amount, 0);
  const freeCashFlow = monthlyIncome - minPayments - monthlyExpenses;

  const stats = [
    { label: "Total Debt", value: formatMoney(totalDebt, currency) },
    { label: "Monthly Income", value: formatMoney(monthlyIncome, currency) },
    { label: "Monthly Expenses", value: formatMoney(monthlyExpenses, currency) },
    { label: "Min. Debt Payments", value: formatMoney(minPayments, currency) },
    { label: "Free Cash Flow", value: formatMoney(freeCashFlow, currency) },
  ];

  const trajectory =
    activeDebts.length > 0
      ? simulatePayoff(
          activeDebts.map((d) => ({
            id: d.id,
            name: d.name,
            balance: d.current_balance,
            interestRate: d.interest_rate,
            minimumPayment: d.minimum_payment,
          })),
          strategy,
          0,
        )
      : null;

  const debtByType = Object.entries(
    activeDebts.reduce<Record<string, number>>((acc, d) => {
      acc[d.debt_type] = (acc[d.debt_type] ?? 0) + d.current_balance;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-1 text-body dark:text-zinc-400">
        Your complete financial overview
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl bg-canvas p-5 shadow-[0_1px_0_rgba(16,20,15,0.06)] dark:bg-zinc-900"
          >
            <p className="text-sm text-mute dark:text-zinc-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-ink dark:text-zinc-50">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {trajectory && (
        <PayoffChart
          planSeries={trajectory.balanceSeries}
          currency={currency}
          title="Debt Payoff Trajectory"
          planLabel="Current path"
          wrapperClassName="mt-8"
        />
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
            Monthly Cash Flow
          </h2>
          <div className="mt-4">
            <CashFlowBar
              income={monthlyIncome}
              expenses={monthlyExpenses}
              debtPayments={minPayments}
              currency={currency}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
            Debt by Type
          </h2>
          {debtByType.length === 0 ? (
            <p className="mt-4 text-sm text-body dark:text-zinc-400">
              Add a debt to see the breakdown.
            </p>
          ) : (
            <div className="mt-4">
              <Bars
                items={debtByType}
                colorClassName="bg-warning dark:bg-amber-400"
                currency={currency}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl bg-canvas p-8 dark:bg-zinc-900">
          {activeDebts.length === 0 ? (
            <>
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50">
                No debts yet
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-body dark:text-zinc-400">
                Add your first debt to see a breakdown here and an automated
                payoff plan.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-ink dark:text-zinc-50">
                {activeDebts.length} active {activeDebts.length === 1 ? "debt" : "debts"}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-body dark:text-zinc-400">
                Totalling {formatMoney(totalDebt, currency)} across your account.
              </p>
              <Link
                href="/debts"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink dark:text-zinc-50"
              >
                View all debts
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        <div className="rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-ink dark:text-zinc-50">
            Quick Actions
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {QUICK_ACTIONS.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-xl bg-canvas-soft px-4 py-3 text-sm font-semibold text-ink dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon size={18} weight="bold" className={action.tint} />
                    {action.label}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  disabled
                  className="flex items-center justify-between rounded-xl bg-canvas-soft px-4 py-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon size={18} weight="bold" className={action.tint} />
                    {action.label}
                  </span>
                  <span className="text-xs font-medium text-mute dark:text-zinc-400">
                    Soon
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
