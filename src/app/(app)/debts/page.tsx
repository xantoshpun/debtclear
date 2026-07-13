import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DebtsView } from "@/components/debts/DebtsView";

export const metadata: Metadata = {
  title: "Debts: DebtClear",
};

export default async function DebtsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: debts }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name")
      .eq("account_id", user.id)
      .order("created_at"),
    supabase
      .from("debts")
      .select(
        "id, profile_id, name, debt_type, original_balance, current_balance, interest_rate, minimum_payment, due_day, notes, is_paid_off",
      )
      .eq("account_id", user.id)
      .order("created_at"),
  ]);

  return <DebtsView profiles={profiles ?? []} initialDebts={debts ?? []} />;
}
