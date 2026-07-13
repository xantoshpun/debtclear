create table debts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid references profiles (id) on delete set null,
  name text not null,
  debt_type text not null check (
    debt_type in ('Credit Card', 'Personal Loan', 'Mortgage', 'Overdraft', 'Other')
  ),
  original_balance numeric(12, 2) not null,
  current_balance numeric(12, 2) not null,
  interest_rate numeric(6, 3) not null,
  minimum_payment numeric(12, 2) not null,
  due_day smallint check (due_day between 1 and 31),
  notes text,
  is_paid_off boolean not null default false,
  created_at timestamptz not null default now()
);

create index debts_account_id_idx on debts (account_id);
create index debts_profile_id_idx on debts (profile_id);

alter table debts enable row level security;

create policy "Account owner manages their own debts"
  on debts
  for all
  using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
