import Link from "next/link";
import { DashboardPreview } from "./DashboardPreview";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-20 lg:grid-cols-2 lg:items-center lg:pt-24 lg:pb-28">
      <div>
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl dark:text-zinc-50">
          One place for every debt. One plan to clear them.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-body dark:text-zinc-300">
          Track every debt, income, and expense together, then follow an
          automated Avalanche or Snowball plan to your debt-free date.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="rounded-3xl bg-brand px-7 py-3.5 text-base font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98]"
          >
            Get started free
          </Link>
          <a
            href="#how-it-works"
            className="rounded-3xl border border-ink/15 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-ink/5 dark:border-white/20 dark:text-zinc-50 dark:hover:bg-white/10"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <DashboardPreview />
      </div>
    </section>
  );
}
