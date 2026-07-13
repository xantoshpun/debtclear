-- Named people tracked under an account (the account owner, plus anyone
-- else they add to track together). Not Supabase auth identities: these
-- people never sign in themselves, per the product's lightweight-profile
-- model.
create table profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index profiles_account_id_idx on profiles (account_id);

alter table profiles enable row level security;

create policy "Account owner manages their own profiles"
  on profiles
  for all
  using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
