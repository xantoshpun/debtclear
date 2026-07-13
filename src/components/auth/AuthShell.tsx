import type { ReactNode } from "react";
import { Nav } from "@/components/home/Nav";

export function AuthShell({
  heading,
  subtext,
  children,
  variant,
}: {
  heading: string;
  subtext: string;
  children: ReactNode;
  variant: "login" | "signup";
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas-soft dark:bg-zinc-950">
      <Nav variant={variant} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-3xl bg-canvas p-8 shadow-[0_24px_60px_-24px_rgba(16,20,15,0.25)] dark:bg-zinc-900">
          <h1 className="text-2xl font-black tracking-tight text-ink dark:text-zinc-50">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-body dark:text-zinc-400">{subtext}</p>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
