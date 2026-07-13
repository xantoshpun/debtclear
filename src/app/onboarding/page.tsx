import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { LogoutLink } from "@/components/onboarding/LogoutLink";

export const metadata: Metadata = {
  title: "Set up your account: DebtClear",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("account_id", user.id)
    .order("created_at");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas-soft dark:bg-zinc-950">
      <header className="border-b border-ink/5 dark:border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-lg font-black tracking-tight text-ink dark:text-zinc-50">
            DebtClear
          </span>
          <LogoutLink />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl bg-canvas p-8 shadow-[0_24px_60px_-24px_rgba(16,20,15,0.25)] dark:bg-zinc-900">
          <OnboardingForm existingProfiles={profiles ?? []} />
        </div>
      </div>
    </div>
  );
}
