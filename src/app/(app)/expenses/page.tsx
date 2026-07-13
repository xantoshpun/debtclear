import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExpensesView } from "@/components/expenses/ExpensesView";

export const metadata: Metadata = {
  title: "Expenses: DebtClear",
};

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: expenses }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name")
      .eq("account_id", user.id)
      .order("created_at"),
    supabase
      .from("expenses")
      .select("id, profile_id, name, category, monthly_amount")
      .eq("account_id", user.id)
      .order("created_at"),
  ]);

  return <ExpensesView profiles={profiles ?? []} initialExpenses={expenses ?? []} />;
}
