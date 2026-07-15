import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings: DebtClear",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: settingsRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name")
      .eq("account_id", user.id)
      .order("created_at"),
    supabase
      .from("settings")
      .select("default_strategy, currency")
      .eq("account_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <SettingsView
      initialProfiles={profiles ?? []}
      initialStrategy={
        (settingsRow?.default_strategy as "avalanche" | "snowball" | undefined) ?? "avalanche"
      }
      initialCurrency={settingsRow?.currency ?? "USD"}
    />
  );
}
