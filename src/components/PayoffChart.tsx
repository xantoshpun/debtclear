"use client";

import { useId, useState } from "react";
import { addMonthsLabel } from "@/lib/payoff";
import { formatMoney, currencySymbol } from "@/lib/currency";

const WIDTH = 720;
const HEIGHT = 260;
const PAD_LEFT = 52;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const INNER_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const INNER_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

function formatCompact(value: number, currency: string): string {
  const symbol = currencySymbol(currency);
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${Math.round(value / 1000)}K`;
  return `${symbol}${Math.round(value)}`;
}

export function PayoffChart({
  planSeries,
  baselineSeries,
  currency,
  title = "Balance Over Time",
  planLabel = "Your plan",
  wrapperClassName = "mt-6",
}: {
  planSeries: number[];
  baselineSeries?: number[];
  currency: string;
  title?: string;
  planLabel?: string;
  wrapperClassName?: string;
}) {
  const gradientId = useId();
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const maxMonths = Math.max(planSeries.length, baselineSeries?.length ?? 0) - 1;
  const maxBalance = baselineSeries?.[0] ?? planSeries[0] ?? 0;

  function x(month: number) {
    return PAD_LEFT + (maxMonths === 0 ? 0 : (month / maxMonths) * INNER_W);
  }
  function y(balance: number) {
    return PAD_TOP + INNER_H - (maxBalance === 0 ? 0 : (balance / maxBalance) * INNER_H);
  }

  function linePath(series: number[]) {
    return series.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");
  }

  function areaPath(series: number[]) {
    const lastMonth = series.length - 1;
    return `${linePath(series)} L ${x(lastMonth).toFixed(2)} ${y(0).toFixed(2)} L ${x(0).toFixed(2)} ${y(0).toFixed(2)} Z`;
  }

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => maxBalance * f);

  const totalYears = Math.ceil(maxMonths / 12);
  const yearStep = totalYears <= 6 ? 1 : totalYears <= 15 ? 2 : 5;
  const xTicks: number[] = [];
  for (let yr = 0; yr <= totalYears; yr += yearStep) xTicks.push(yr * 12);

  const planEndMonth = (() => {
    const i = planSeries.findIndex((v) => v <= 0.01);
    return i === -1 ? planSeries.length - 1 : i;
  })();

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverMonth(Math.round(frac * maxMonths));
  }

  const shownMonth = hoverMonth ?? planEndMonth;
  const planValue = planSeries[Math.min(shownMonth, planSeries.length - 1)] ?? 0;
  const baselineValue = baselineSeries
    ? (baselineSeries[Math.min(shownMonth, baselineSeries.length - 1)] ?? 0)
    : null;

  return (
    <div className={`${wrapperClassName} rounded-3xl bg-canvas p-6 dark:bg-zinc-900`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">{title}</h2>
        {baselineSeries && (
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-ink dark:text-zinc-50">
              <span className="h-0.5 w-3 rounded-full bg-positive-deep dark:bg-emerald-400" />
              {planLabel}
            </span>
            <span className="flex items-center gap-1.5 text-mute dark:text-zinc-400">
              <span className="h-0.5 w-3 rounded-full bg-mute dark:bg-zinc-600" />
              Minimums only
            </span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label={
          baselineSeries
            ? "Chart comparing total debt balance over time under your plan versus paying only the minimums"
            : "Chart showing total debt balance declining to zero over time"
        }
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.12"
              className="text-positive-deep dark:text-emerald-400"
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0"
              className="text-positive-deep dark:text-emerald-400"
            />
          </linearGradient>
        </defs>

        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y(v)}
              y2={y(v)}
              className="stroke-ink/10 dark:stroke-white/10"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-mute dark:fill-zinc-500 text-[10px]"
            >
              {formatCompact(v, currency)}
            </text>
          </g>
        ))}

        {xTicks.map((m) => (
          <text
            key={m}
            x={x(m)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-mute dark:fill-zinc-500 text-[10px]"
          >
            {m === 0 ? "Now" : `${m / 12}y`}
          </text>
        ))}

        {baselineSeries && (
          <path
            d={linePath(baselineSeries)}
            fill="none"
            className="stroke-mute dark:stroke-zinc-600"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        <path d={areaPath(planSeries)} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath(planSeries)}
          fill="none"
          className="stroke-positive-deep dark:stroke-emerald-400"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx={x(planEndMonth)}
          cy={y(0)}
          r={4}
          className="fill-positive-deep dark:fill-emerald-400 stroke-canvas dark:stroke-zinc-900"
          strokeWidth={2}
        />

        {hoverMonth !== null && (
          <line
            x1={x(hoverMonth)}
            x2={x(hoverMonth)}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            className="stroke-ink/20 dark:stroke-white/20"
            strokeWidth={1}
          />
        )}

        <rect
          x={PAD_LEFT}
          y={PAD_TOP}
          width={INNER_W}
          height={INNER_H}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverMonth(null)}
        />
      </svg>

      <div className="mt-2 flex items-center justify-between rounded-xl bg-canvas-soft px-4 py-2 text-sm dark:bg-zinc-800">
        <span className="text-mute dark:text-zinc-400">
          {shownMonth === 0 ? "Now" : addMonthsLabel(shownMonth)}
        </span>
        <span className="flex gap-4">
          <span className="font-semibold text-positive-deep dark:text-emerald-400">
            {formatMoney(planValue, currency)}
          </span>
          {baselineValue !== null && (
            <span className="font-semibold text-mute dark:text-zinc-400">
              {formatMoney(baselineValue, currency)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
