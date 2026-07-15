import {
  ChartLineUp,
  Sliders,
  UsersThree,
  ChartPieSlice,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/Reveal";

export function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <Reveal>
        <h2 className="max-w-lg text-3xl font-black tracking-tight text-ink sm:text-4xl dark:text-zinc-50">
          Everything a payoff plan needs, nothing it doesn't
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-4 md:grid-rows-2">
        <Reveal className="md:col-span-2 md:row-span-2 rounded-3xl bg-brand-pale p-8 dark:bg-zinc-900">
          <ChartLineUp size={28} weight="bold" className="text-ink-deep dark:text-brand" />
          <h3 className="mt-5 text-xl font-bold text-ink dark:text-zinc-50">
            Avalanche or Snowball payoff plan
          </h3>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-body dark:text-zinc-300">
            DebtClear orders every debt by your chosen strategy, projects a
            debt-free date, and tells you exactly where to send your next
            extra pound.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="md:col-span-2 rounded-3xl bg-canvas p-8 shadow-[0_1px_0_rgba(16,20,15,0.06)] dark:bg-zinc-900/60">
          <Sliders size={28} weight="bold" className="text-accent-cyan-deep dark:text-sky-400" />
          <h3 className="mt-5 text-xl font-bold text-ink dark:text-zinc-50">
            What-if simulator
          </h3>
          <p className="mt-3 max-w-md text-base leading-relaxed text-body dark:text-zinc-300">
            Drag in an extra monthly payment or a one-time lump sum and see
            the new payoff date and interest saved instantly.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="rounded-3xl bg-ink p-8 dark:bg-zinc-50">
          <UsersThree size={28} weight="bold" className="text-brand dark:text-ink" />
          <h3 className="mt-5 text-lg font-bold text-white dark:text-ink">
            Track together
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70 dark:text-ink/70">
            Add anyone you share money with, no separate login needed, and
            tag every debt, income, and bill to whoever it belongs to.
          </p>
        </Reveal>

        <Reveal delay={0.18} className="rounded-3xl bg-canvas p-8 shadow-[0_1px_0_rgba(16,20,15,0.06)] dark:bg-zinc-900/60">
          <ChartPieSlice size={28} weight="bold" className="text-positive dark:text-emerald-400" />
          <h3 className="mt-5 text-lg font-bold text-ink dark:text-zinc-50">
            Reports, exportable
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-body dark:text-zinc-300">
            Monthly trends and a full data export, always yours to keep.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
