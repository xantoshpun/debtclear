"use client";

import { formatMoney } from "@/lib/currency";

export function CashFlowBar({
  income,
  expenses,
  debtPayments,
  currency,
}: {
  income: number;
  expenses: number;
  debtPayments: number;
  currency: string;
}) {
  const money = (amount: number) => formatMoney(amount, currency);
  const freeCashFlow = income - expenses - debtPayments;
  const overspend = freeCashFlow < 0;

  const total = overspend ? expenses + debtPayments : income || 1;
  const segments = [
    { label: "Expenses", value: expenses, colorClass: "bg-accent-cyan-deep dark:bg-sky-400" },
    {
      label: "Debt Payments",
      value: debtPayments,
      colorClass: "bg-positive-deep dark:bg-emerald-400",
    },
  ];

  return (
    <div>
      <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-full bg-canvas-soft dark:bg-zinc-800">
        {segments.map((s) => (
          <div key={s.label} className={s.colorClass} style={{ width: `${(s.value / total) * 100}%` }} />
        ))}
        {!overspend && (
          <div className="bg-brand" style={{ width: `${(Math.max(0, freeCashFlow) / total) * 100}%` }} />
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${s.colorClass}`} />
            <span className="text-body dark:text-zinc-400">{s.label}</span>
            <span className="font-semibold text-ink dark:text-zinc-50">{money(s.value)}</span>
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${overspend ? "bg-negative" : "bg-brand"}`} />
          <span className="text-body dark:text-zinc-400">Free Cash Flow</span>
          <span className={`font-semibold ${overspend ? "text-negative" : "text-ink dark:text-zinc-50"}`}>
            {overspend ? "-" : ""}
            {money(Math.abs(freeCashFlow))}
          </span>
        </span>
      </div>
    </div>
  );
}
