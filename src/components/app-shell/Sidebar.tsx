"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  CreditCard,
  CurrencyDollar,
  Receipt,
  ChartLineUp,
  ChartBar,
  Sliders,
  ChartPieSlice,
  Gear,
  List,
  X,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour, tint: "" },
  { href: "/debts", label: "Debts", icon: CreditCard, tint: "text-warning dark:text-amber-400" },
  { href: "/income", label: "Income", icon: CurrencyDollar, tint: "text-positive dark:text-emerald-400" },
  { href: "/expenses", label: "Expenses", icon: Receipt, tint: "text-accent-cyan-deep dark:text-sky-400" },
  { href: "/payoff-plan", label: "Payoff Plan", icon: ChartLineUp, tint: "text-ink-deep dark:text-brand" },
  { href: "/simulator", label: "Simulator", icon: Sliders, tint: "text-accent-cyan-deep dark:text-sky-400" },
  { href: "/payments", label: "Payments", icon: ChartBar, tint: "text-positive-deep dark:text-emerald-400" },
  { href: "/reports", label: "Reports", icon: ChartPieSlice, tint: "" },
  { href: "/settings", label: "Settings", icon: Gear, tint: "" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              active
                ? "bg-brand-pale text-ink dark:bg-zinc-800 dark:text-zinc-50"
                : "text-body hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
            }`}
          >
            <link.icon
              size={18}
              weight="bold"
              className={link.tint ? `${link.tint} ${active ? "" : "opacity-60"}` : undefined}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ subtitle }: { subtitle: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-ink/5 bg-canvas px-6 py-4 lg:hidden dark:border-white/5 dark:bg-zinc-900">
        <span className="text-lg font-black tracking-tight text-ink dark:text-zinc-50">
          DebtClear
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-full text-ink dark:text-zinc-50"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </header>

      {open && (
        <div className="flex flex-col gap-6 border-b border-ink/5 bg-canvas px-6 py-4 lg:hidden dark:border-white/5 dark:bg-zinc-900">
          <NavLinks onNavigate={() => setOpen(false)} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-negative"
          >
            <SignOut size={18} weight="bold" />
            Log out
          </button>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-ink/5 bg-canvas px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] dark:border-white/5 dark:bg-zinc-900">
        <div className="px-2">
          <span className="text-lg font-black tracking-tight text-ink dark:text-zinc-50">
            DebtClear
          </span>
          <p className="mt-0.5 text-sm text-mute dark:text-zinc-400">{subtitle}</p>
        </div>

        <div className="mt-8 flex-1">
          <NavLinks />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-negative hover:bg-negative/5"
        >
          <SignOut size={18} weight="bold" />
          Log out
        </button>
      </aside>
    </>
  );
}
