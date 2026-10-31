-- AYSM COMPTA first-release schema: president is the only active role.
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

do $$ begin
  create type public.aysm_role as enum ('president','pending');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null default '',
  role public.aysm_role not null default 'pending',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.aysm_create_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name,role,is_active)
  values(new.id,coalesce(new.raw_user_meta_data->>'display_name',''),'pending',false)
  on conflict(id) do nothing;
  return new;
end; $$;
revoke all on function private.aysm_create_profile() from public,anon,authenticated;
drop trigger if exists aysm_auth_user_profile on auth.users;
create trigger aysm_auth_user_profile after insert on auth.users
for each row execute function private.aysm_create_profile();

create or replace function private.aysm_my_role()
returns public.aysm_role language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p
  where p.id=(select auth.uid()) and p.is_active=true limit 1;
$$;
create or replace function private.aysm_is_active()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true);
$$;
create or replace function private.aysm_can_access_module(p_module text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.aysm_my_role()='president',false);
$$;
revoke all on function private.aysm_my_role() from public,anon;
revoke all on function private.aysm_is_active() from public,anon;
revoke all on function private.aysm_can_access_module(text) from public,anon;
grant execute on function private.aysm_my_role() to authenticated;
grant execute on function private.aysm_is_active() to authenticated;
grant execute on function private.aysm_can_access_module(text) to authenticated;

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  module text not null check(module in ('association_profile','fiscal_years','accounts','entries','recettes','depenses','disbursements','bank_accounts','subventions','projects','budgets','immobilisations','members','documents','volunteers','in_kind','audit_logs')),
  payload jsonb not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision bigint not null default 1,
  archived_at timestamptz null,
  constraint app_records_one_row_per_module unique(module)
);
create index if not exists app_records_module_updated_idx on public.app_records(module,updated_at desc);
create index if not exists app_records_payload_gin_idx on public.app_records using gin(payload);
create index if not exists app_records_created_by_idx on public.app_records(created_by);
create index if not exists app_records_updated_by_idx on public.app_records(updated_by);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  record_id uuid null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_actor_id_idx on public.audit_events(actor_id);

alter table public.profiles enable row level security;
alter table public.app_records enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists profile_read_self_or_president on public.profiles;
create policy profile_read_self_or_president on public.profiles for select to authenticated
using(id=(select auth.uid()) or (select private.aysm_my_role())='president');
drop policy if exists president_manage_profiles on public.profiles;
create policy president_manage_profiles on public.profiles for all to authenticated
using((select private.aysm_my_role())='president')
with check((select private.aysm_my_role())='president');

drop policy if exists records_select_by_role on public.app_records;
create policy records_select_by_role on public.app_records for select to authenticated
using((select private.aysm_can_access_module(module)));
drop policy if exists records_insert_by_role on public.app_records;
create policy records_insert_by_role on public.app_records for insert to authenticated
with check((select private.aysm_can_access_module(module)) and created_by=(select auth.uid()) and updated_by=(select auth.uid()));
drop policy if exists records_update_by_role on public.app_records;
create policy records_update_by_role on public.app_records for update to authenticated
using((select private.aysm_can_access_module(module)))
with check((select private.aysm_can_access_module(module)) and updated_by=(select auth.uid()));
-- Accounting rows and audit events are not hard-deleted.
drop policy if exists audit_read_president on public.audit_events;
create policy audit_read_president on public.audit_events for select to authenticated
using((select private.aysm_my_role())='president');
drop policy if exists audit_insert_self on public.audit_events;
create policy audit_insert_self on public.audit_events for insert to authenticated
with check(actor_id=(select auth.uid()) and (select private.aysm_is_active()));

revoke all on public.profiles,public.app_records,public.audit_events from anon;
grant select,insert,update on public.profiles to authenticated;
grant select,insert,update on public.app_records to authenticated;
grant select,insert on public.audit_events to authenticated;
