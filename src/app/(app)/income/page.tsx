import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IncomeView } from "@/components/income/IncomeView";

export const metadata: Metadata = {
  title: "Income: DebtClear",
};

export default async function IncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: income }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name")
      .eq("account_id", user.id)
      .order("created_at"),
    supabase
      .from("income")
      .select("id, profile_id, source, job_title, income_type, monthly_amount")
      .eq("account_id", user.id)
      .order("created_at"),
  ]);

  return <IncomeView profiles={profiles ?? []} initialIncome={income ?? []} />;
}
