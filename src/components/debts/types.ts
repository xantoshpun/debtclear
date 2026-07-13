export type Profile = { id: string; name: string };

export const DEBT_TYPES = [
  "Credit Card",
  "Personal Loan",
  "Mortgage",
  "Overdraft",
  "Other",
] as const;

export type DebtType = (typeof DEBT_TYPES)[number];

export type Debt = {
  id: string;
  profile_id: string | null;
  name: string;
  debt_type: DebtType;
  original_balance: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_day: number | null;
  notes: string | null;
  is_paid_off: boolean;
};
