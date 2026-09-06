create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_profile_for_new_user();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

create table if not exists public.admin_config_records (
  id uuid primary key default gen_random_uuid(),
  config_type text not null check (config_type in ('ai_command', 'plugin_connector', 'skin_theme')),
  name text not null,
  category text not null,
  description text not null,
  enabled boolean not null default false,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  approval_status text not null check (approval_status in ('pending', 'approved', 'rejected', 'requires_credentials')),
  requires_credentials boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.admin_config_records enable row level security;
alter table public.admin_audit_events enable row level security;

drop policy if exists "Profiles are self readable" on public.profiles;
create policy "Profiles are self readable"
on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Only admins mutate roles" on public.profiles;
create policy "Only admins mutate roles"
on public.profiles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins manage config" on public.admin_config_records;
create policy "Admins manage config"
on public.admin_config_records
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins view audit events" on public.admin_audit_events;
create policy "Admins view audit events"
on public.admin_audit_events
for select
using (public.is_admin(auth.uid()));

drop policy if exists "Admins insert audit events" on public.admin_audit_events;
create policy "Admins insert audit events"
on public.admin_audit_events
for insert
with check (public.is_admin(auth.uid()));
