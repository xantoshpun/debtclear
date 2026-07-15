import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { SettingsProvider, type Settings } from "@/components/settings/SettingsContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: settingsRow }] = await Promise.all([
    supabase.from("profiles").select("name").eq("account_id", user.id).order("created_at"),
    supabase
      .from("settings")
      .select("default_strategy, currency")
      .eq("account_id", user.id)
      .maybeSingle(),
  ]);

  if (!profiles || profiles.length === 0) redirect("/onboarding");

  const subtitle = profiles.map((p) => p.name).join(" & ");
  const settings: Settings = {
    defaultStrategy: (settingsRow?.default_strategy as Settings["defaultStrategy"]) ?? "avalanche",
    currency: settingsRow?.currency ?? "USD",
  };

  return (
    <SettingsProvider settings={settings}>
      <div className="flex min-h-[100dvh] flex-col bg-canvas-soft lg:flex-row dark:bg-zinc-950">
        <Sidebar subtitle={subtitle} />
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </SettingsProvider>
  );
}
