"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#household", label: "Track together" },
];

type NavVariant = "default" | "login" | "signup";

function AuthActions({ variant }: { variant: NavVariant }) {
  if (variant === "login") {
    return (
      <>
        <span className="text-sm text-body dark:text-zinc-400">
          Don&apos;t have an account?
        </span>
        <Link
          href="/signup"
          className="rounded-3xl px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Sign up
        </Link>
      </>
    );
  }

  if (variant === "signup") {
    return (
      <>
        <span className="text-sm text-body dark:text-zinc-400">
          Already have an account?
        </span>
        <Link
          href="/login"
          className="rounded-3xl px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="rounded-3xl px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 dark:text-zinc-50 dark:hover:bg-white/10"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform active:scale-[0.98]"
      >
        Get started free
      </Link>
    </>
  );
}

export function Nav({ variant = "default" }: { variant?: NavVariant }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas-soft/90 backdrop-blur dark:border-white/5 dark:bg-zinc-950/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-black tracking-tight text-ink dark:text-zinc-50">
          DebtClear
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-body hover:text-ink dark:text-zinc-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <AuthActions variant={variant} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-full text-ink lg:hidden dark:text-zinc-50"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-ink/5 px-6 py-4 lg:hidden dark:border-white/5">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-body dark:text-zinc-300"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col items-center gap-2">
            <AuthActions variant={variant} />
          </div>
        </div>
      )}
    </header>
  );
}
