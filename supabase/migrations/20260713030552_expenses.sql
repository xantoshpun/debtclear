-- Expenses can be Joint like debts (nullable profile_id), unlike income.
create table expenses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid references profiles (id) on delete set null,
  name text not null,
  category text not null check (
    category in (
      'Housing', 'Food', 'Transportation', 'Utilities',
      'Entertainment', 'Clothing', 'Subscriptions', 'Other'
    )
  ),
  monthly_amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index expenses_account_id_idx on expenses (account_id);
create index expenses_profile_id_idx on expenses (profile_id);

alter table expenses enable row level security;

create policy "Account owner manages their own expenses"
  on expenses
  for all
  using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
