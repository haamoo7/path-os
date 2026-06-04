create table if not exists public.account_profiles (
  user_id text primary key default auth.user_id(),
  email text not null,
  full_name text,
  app_role text not null check (app_role in ('seeker', 'company', 'university')),
  organization text,
  workspace jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_account_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_account_profiles_updated_at on public.account_profiles;

create trigger set_account_profiles_updated_at
before update on public.account_profiles
for each row
execute function public.set_account_profiles_updated_at();

alter table public.account_profiles enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on table public.account_profiles to authenticated;
alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

drop policy if exists "account_profiles_select_own" on public.account_profiles;
create policy "account_profiles_select_own"
on public.account_profiles
for select
using (user_id = auth.user_id());

drop policy if exists "account_profiles_insert_own" on public.account_profiles;
create policy "account_profiles_insert_own"
on public.account_profiles
for insert
with check (user_id = auth.user_id());

drop policy if exists "account_profiles_update_own" on public.account_profiles;
create policy "account_profiles_update_own"
on public.account_profiles
for update
using (user_id = auth.user_id())
with check (user_id = auth.user_id());

drop policy if exists "account_profiles_delete_own" on public.account_profiles;
create policy "account_profiles_delete_own"
on public.account_profiles
for delete
using (user_id = auth.user_id());

notify pgrst, 'reload schema';
