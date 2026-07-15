-- One settings row per account (account_id is the primary key, not a
-- separate uuid, since this is always a singleton per account).
create table settings (
  account_id uuid primary key references auth.users (id) on delete cascade,
  default_strategy text not null default 'avalanche' check (
    default_strategy in ('avalanche', 'snowball')
  ),
  currency text not null default 'USD' check (
    currency in ('USD', 'GBP', 'EUR', 'CAD', 'AUD')
  ),
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

create policy "Account owner manages their own settings"
  on settings
  for all
  using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
