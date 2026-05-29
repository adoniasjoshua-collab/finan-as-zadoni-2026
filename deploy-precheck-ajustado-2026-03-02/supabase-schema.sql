-- Execute este script no SQL Editor do Supabase.
-- Versao para deploy publico (GitHub) com Supabase Auth + RLS.

create extension if not exists pgcrypto;

create table if not exists public.zd_products (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_sales (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_purchases (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_withdrawals (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_partner_contributions (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_partner_goals (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_ads_investments (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zd_personal_transactions (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.zd_products add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_sales add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_purchases add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_withdrawals add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_partner_contributions add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_partner_goals add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_ads_investments add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.zd_personal_transactions add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table public.zd_products alter column owner_id set default auth.uid();
alter table public.zd_sales alter column owner_id set default auth.uid();
alter table public.zd_purchases alter column owner_id set default auth.uid();
alter table public.zd_withdrawals alter column owner_id set default auth.uid();
alter table public.zd_partner_contributions alter column owner_id set default auth.uid();
alter table public.zd_partner_goals alter column owner_id set default auth.uid();
alter table public.zd_ads_investments alter column owner_id set default auth.uid();
alter table public.zd_personal_transactions alter column owner_id set default auth.uid();

create index if not exists idx_zd_products_created_at on public.zd_products (created_at desc);
create index if not exists idx_zd_sales_created_at on public.zd_sales (created_at desc);
create index if not exists idx_zd_purchases_created_at on public.zd_purchases (created_at desc);
create index if not exists idx_zd_withdrawals_created_at on public.zd_withdrawals (created_at desc);
create index if not exists idx_zd_partner_contrib_created_at on public.zd_partner_contributions (created_at desc);
create index if not exists idx_zd_partner_goals_created_at on public.zd_partner_goals (created_at desc);
create index if not exists idx_zd_ads_investments_created_at on public.zd_ads_investments (created_at desc);
create index if not exists idx_zd_personal_transactions_created_at on public.zd_personal_transactions (created_at desc);

create index if not exists idx_zd_products_owner_id on public.zd_products (owner_id);
create index if not exists idx_zd_sales_owner_id on public.zd_sales (owner_id);
create index if not exists idx_zd_purchases_owner_id on public.zd_purchases (owner_id);
create index if not exists idx_zd_withdrawals_owner_id on public.zd_withdrawals (owner_id);
create index if not exists idx_zd_partner_contrib_owner_id on public.zd_partner_contributions (owner_id);
create index if not exists idx_zd_partner_goals_owner_id on public.zd_partner_goals (owner_id);
create index if not exists idx_zd_ads_investments_owner_id on public.zd_ads_investments (owner_id);
create index if not exists idx_zd_personal_transactions_owner_id on public.zd_personal_transactions (owner_id);

alter table public.zd_products enable row level security;
alter table public.zd_sales enable row level security;
alter table public.zd_purchases enable row level security;
alter table public.zd_withdrawals enable row level security;
alter table public.zd_partner_contributions enable row level security;
alter table public.zd_partner_goals enable row level security;
alter table public.zd_ads_investments enable row level security;
alter table public.zd_personal_transactions enable row level security;

drop policy if exists zd_products_select_own on public.zd_products;
drop policy if exists zd_products_insert_own on public.zd_products;
drop policy if exists zd_products_update_own on public.zd_products;
drop policy if exists zd_products_delete_own on public.zd_products;
create policy zd_products_select_own on public.zd_products for select to authenticated using (owner_id = auth.uid());
create policy zd_products_insert_own on public.zd_products for insert to authenticated with check (owner_id = auth.uid());
create policy zd_products_update_own on public.zd_products for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_products_delete_own on public.zd_products for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_sales_select_own on public.zd_sales;
drop policy if exists zd_sales_insert_own on public.zd_sales;
drop policy if exists zd_sales_update_own on public.zd_sales;
drop policy if exists zd_sales_delete_own on public.zd_sales;
create policy zd_sales_select_own on public.zd_sales for select to authenticated using (owner_id = auth.uid());
create policy zd_sales_insert_own on public.zd_sales for insert to authenticated with check (owner_id = auth.uid());
create policy zd_sales_update_own on public.zd_sales for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_sales_delete_own on public.zd_sales for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_purchases_select_own on public.zd_purchases;
drop policy if exists zd_purchases_insert_own on public.zd_purchases;
drop policy if exists zd_purchases_update_own on public.zd_purchases;
drop policy if exists zd_purchases_delete_own on public.zd_purchases;
create policy zd_purchases_select_own on public.zd_purchases for select to authenticated using (owner_id = auth.uid());
create policy zd_purchases_insert_own on public.zd_purchases for insert to authenticated with check (owner_id = auth.uid());
create policy zd_purchases_update_own on public.zd_purchases for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_purchases_delete_own on public.zd_purchases for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_withdrawals_select_own on public.zd_withdrawals;
drop policy if exists zd_withdrawals_insert_own on public.zd_withdrawals;
drop policy if exists zd_withdrawals_update_own on public.zd_withdrawals;
drop policy if exists zd_withdrawals_delete_own on public.zd_withdrawals;
create policy zd_withdrawals_select_own on public.zd_withdrawals for select to authenticated using (owner_id = auth.uid());
create policy zd_withdrawals_insert_own on public.zd_withdrawals for insert to authenticated with check (owner_id = auth.uid());
create policy zd_withdrawals_update_own on public.zd_withdrawals for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_withdrawals_delete_own on public.zd_withdrawals for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_partner_contributions_select_own on public.zd_partner_contributions;
drop policy if exists zd_partner_contributions_insert_own on public.zd_partner_contributions;
drop policy if exists zd_partner_contributions_update_own on public.zd_partner_contributions;
drop policy if exists zd_partner_contributions_delete_own on public.zd_partner_contributions;
create policy zd_partner_contributions_select_own on public.zd_partner_contributions for select to authenticated using (owner_id = auth.uid());
create policy zd_partner_contributions_insert_own on public.zd_partner_contributions for insert to authenticated with check (owner_id = auth.uid());
create policy zd_partner_contributions_update_own on public.zd_partner_contributions for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_partner_contributions_delete_own on public.zd_partner_contributions for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_partner_goals_select_own on public.zd_partner_goals;
drop policy if exists zd_partner_goals_insert_own on public.zd_partner_goals;
drop policy if exists zd_partner_goals_update_own on public.zd_partner_goals;
drop policy if exists zd_partner_goals_delete_own on public.zd_partner_goals;
create policy zd_partner_goals_select_own on public.zd_partner_goals for select to authenticated using (owner_id = auth.uid());
create policy zd_partner_goals_insert_own on public.zd_partner_goals for insert to authenticated with check (owner_id = auth.uid());
create policy zd_partner_goals_update_own on public.zd_partner_goals for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_partner_goals_delete_own on public.zd_partner_goals for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_ads_investments_select_own on public.zd_ads_investments;
drop policy if exists zd_ads_investments_insert_own on public.zd_ads_investments;
drop policy if exists zd_ads_investments_update_own on public.zd_ads_investments;
drop policy if exists zd_ads_investments_delete_own on public.zd_ads_investments;
create policy zd_ads_investments_select_own on public.zd_ads_investments for select to authenticated using (owner_id = auth.uid());
create policy zd_ads_investments_insert_own on public.zd_ads_investments for insert to authenticated with check (owner_id = auth.uid());
create policy zd_ads_investments_update_own on public.zd_ads_investments for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_ads_investments_delete_own on public.zd_ads_investments for delete to authenticated using (owner_id = auth.uid());

drop policy if exists zd_personal_transactions_select_own on public.zd_personal_transactions;
drop policy if exists zd_personal_transactions_insert_own on public.zd_personal_transactions;
drop policy if exists zd_personal_transactions_update_own on public.zd_personal_transactions;
drop policy if exists zd_personal_transactions_delete_own on public.zd_personal_transactions;
create policy zd_personal_transactions_select_own on public.zd_personal_transactions for select to authenticated using (owner_id = auth.uid());
create policy zd_personal_transactions_insert_own on public.zd_personal_transactions for insert to authenticated with check (owner_id = auth.uid());
create policy zd_personal_transactions_update_own on public.zd_personal_transactions for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy zd_personal_transactions_delete_own on public.zd_personal_transactions for delete to authenticated using (owner_id = auth.uid());

-- Opcional (apos migrar dados antigos): tornar owner_id NOT NULL.
-- alter table public.zd_products alter column owner_id set not null;
-- alter table public.zd_sales alter column owner_id set not null;
-- alter table public.zd_purchases alter column owner_id set not null;
-- alter table public.zd_withdrawals alter column owner_id set not null;
-- alter table public.zd_partner_contributions alter column owner_id set not null;
-- alter table public.zd_partner_goals alter column owner_id set not null;
-- alter table public.zd_ads_investments alter column owner_id set not null;
-- alter table public.zd_personal_transactions alter column owner_id set not null;
