import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentsView } from "@/components/payments/PaymentsView";
import type { Payment } from "@/components/payments/types";

export const metadata: Metadata = {
  title: "Payments: DebtClear",
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: debts }, { data: payments }] = await Promise.all([
    supabase
      .from("debts")
      .select("id, name, current_balance, original_balance")
      .eq("account_id", user.id)
      .eq("is_paid_off", false)
      .order("created_at"),
    supabase
      .from("payments")
      .select("id, debt_id, amount, payment_date, notes, debts(name)")
      .eq("account_id", user.id)
      .order("payment_date", { ascending: false }),
  ]);

  return (
    <PaymentsView
      initialDebts={debts ?? []}
      initialPayments={(payments ?? []) as unknown as Payment[]}
    />
  );
}
