import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PayoffPlanView } from "@/components/payoff-plan/PayoffPlanView";
import type { PayoffInputDebt } from "@/lib/payoff";

export const metadata: Metadata = {
  title: "Payoff Plan: DebtClear",
};

export default async function PayoffPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: debts } = await supabase
    .from("debts")
    .select("id, name, current_balance, interest_rate, minimum_payment")
    .eq("account_id", user.id)
    .eq("is_paid_off", false);

  const input: PayoffInputDebt[] = (debts ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.current_balance,
    interestRate: d.interest_rate,
    minimumPayment: d.minimum_payment,
  }));

  return <PayoffPlanView debts={input} />;
}
