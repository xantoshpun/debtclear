"use client";

import { formatMoney } from "@/lib/currency";

export function Bars({
  items,
  colorClassName,
  currency,
  suffix,
  orientation = "horizontal",
}: {
  items: { label: string; value: number }[];
  colorClassName: string;
  /** Format values as money in this currency. Takes priority over `suffix`. */
  currency?: string;
  /** Appended after the rounded value, e.g. "%". Ignored when `currency` is set. */
  suffix?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  function formatValue(value: number) {
    if (currency) return formatMoney(value, currency);
    return `${Math.round(value).toLocaleString()}${suffix ?? ""}`;
  }

  if (orientation === "vertical") {
    return (
      <div className="flex items-end gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-ink dark:text-zinc-50">
              {formatValue(item.value)}
            </span>
            <div className="flex h-32 w-full items-end justify-center rounded-md bg-canvas-soft dark:bg-zinc-800">
              <div
                className={`w-full rounded-t-[4px] transition-[height] ${colorClassName}`}
                style={{ height: `${Math.max(2, (item.value / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-mute dark:text-zinc-400">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span
            title={item.label}
            className="w-32 shrink-0 truncate text-sm text-body dark:text-zinc-400"
          >
            {item.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-md bg-canvas-soft dark:bg-zinc-800">
            <div
              className={`h-full rounded-r-[4px] transition-[width] ${colorClassName}`}
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-sm font-semibold text-ink dark:text-zinc-50">
            {formatValue(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
