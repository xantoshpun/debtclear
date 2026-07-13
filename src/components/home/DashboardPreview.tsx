const BREAKDOWN = [
  { label: "Credit cards", value: 24735, color: "#7ed957" },
  { label: "Personal loans", value: 26400, color: "#10140f" },
  { label: "Mortgage", value: 0, color: "#b9f393" },
];

const TOTAL = BREAKDOWN.reduce((sum, d) => sum + d.value, 0);

function ringGradient() {
  let cursor = 0;
  const stops = BREAKDOWN.map((d) => {
    const start = (cursor / TOTAL) * 360;
    cursor += d.value;
    const end = (cursor / TOTAL) * 360;
    return `${d.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function DashboardPreview() {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-canvas p-6 shadow-[0_24px_60px_-24px_rgba(16,20,15,0.25)] dark:bg-zinc-900">
      <p className="text-sm text-mute dark:text-zinc-400">Total debt</p>
      <p className="mt-1 text-4xl font-black tracking-tight text-ink dark:text-zinc-50">
        £51,135
      </p>

      <div className="mt-6 flex items-center gap-5">
        <div
          className="relative size-24 shrink-0 rounded-full"
          style={{ background: ringGradient() }}
        >
          <div className="absolute inset-2 rounded-full bg-canvas dark:bg-zinc-900" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {BREAKDOWN.filter((d) => d.value > 0).map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-body dark:text-zinc-300">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.label}
              </span>
              <span className="font-semibold text-ink dark:text-zinc-50">
                £{d.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-brand-pale p-4 dark:bg-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink dark:text-zinc-50">
            Debt-free in
          </p>
          <p className="text-sm font-semibold text-positive dark:text-emerald-400">
            2y 11m
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60 dark:bg-zinc-700">
          <div className="h-full w-[38%] rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}
