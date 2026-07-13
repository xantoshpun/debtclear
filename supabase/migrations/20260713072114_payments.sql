create table payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  debt_id uuid not null references debts (id) on delete cascade,
  amount numeric(12, 2) not null,
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index payments_account_id_idx on payments (account_id);
create index payments_debt_id_idx on payments (debt_id);

alter table payments enable row level security;

create policy "Account owner manages their own payments"
  on payments
  for all
  using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
