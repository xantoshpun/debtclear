export type Debt = {
  id: string;
  name: string;
  current_balance: number;
  original_balance: number;
};

export type Payment = {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  debts: { name: string } | null;
};
