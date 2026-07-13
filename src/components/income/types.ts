export type Profile = { id: string; name: string };

export const INCOME_TYPES = ["Salary", "Other"] as const;
export type IncomeType = (typeof INCOME_TYPES)[number];

export type Income = {
  id: string;
  profile_id: string;
  source: string;
  job_title: string | null;
  income_type: IncomeType;
  monthly_amount: number;
};
