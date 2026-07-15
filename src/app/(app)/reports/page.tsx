import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportsView, type ReportsPayment } from "@/components/reports/ReportsView";

export const metadata: Metadata = {
  title: "Reports: DebtClear",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: debts }, { data: income }, { data: expenses }, { data: payments }] =
    await Promise.all([
      supabase
        .from("debts")
        .select(
          "id, name, debt_type, original_balance, current_balance, interest_rate, minimum_payment, is_paid_off",
        )
        .eq("account_id", user.id)
        .order("created_at"),
      supabase
        .from("income")
        .select("id, source, income_type, monthly_amount")
        .eq("account_id", user.id)
        .order("created_at"),
      supabase
        .from("expenses")
        .select("id, name, category, monthly_amount")
        .eq("account_id", user.id)
        .order("created_at"),
      supabase
        .from("payments")
        .select("id, debt_id, amount, payment_date, notes, debts(name)")
        .eq("account_id", user.id)
        .order("payment_date"),
    ]);

  return (
    <ReportsView
      debts={debts ?? []}
      income={income ?? []}
      expenses={expenses ?? []}
      payments={(payments ?? []) as unknown as ReportsPayment[]}
    />
  );
}
