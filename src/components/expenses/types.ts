export type Profile = { id: string; name: string };

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Clothing",
  "Subscriptions",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string;
  profile_id: string | null;
  name: string;
  category: ExpenseCategory;
  monthly_amount: number;
};
