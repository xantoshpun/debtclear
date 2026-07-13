-- Income always belongs to a specific person (no "joint" concept, unlike debts).
create table income (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  source text not null,
  job_title text,
  income_type text not null default 'Salary' check (income_type in ('Salary', 'Other')),
  monthly_amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index income_account_id_idx on income (account_id);
create index income_profile_id_idx on income (profile_id);

alter table income enable row level security;

create policy "Account owner manages their own income"
  on income
  for all
  using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
