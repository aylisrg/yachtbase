-- Enable UUID extension (usually already enabled in Supabase)
create extension if not exists "uuid-ossp";

-- Users table: extends Supabase auth.users with app-specific fields
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  auth_provider text not null default 'google',
  role        text not null default 'viewer'
              check (role in ('super_admin', 'admin', 'editor', 'viewer', 'api_client_manager')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index on email for fast lookups
create index idx_users_email on public.users(email);

-- Row-Level Security
alter table public.users enable row level security;

-- Policy: authenticated users can read their own profile
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

-- Policy: super_admin and admin can read all users
create policy "Admins can read all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin')
    )
  );

-- Policy: super_admin can update any user
create policy "Super admins can update users"
  on public.users for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'super_admin'
    )
  );

-- Audit logs table
create table public.audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  actor_user_id   uuid references public.users(id) on delete set null,
  entity_type     text not null,
  entity_id       text not null,
  action          text not null,
  before_json     jsonb,
  after_json      jsonb,
  created_at      timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_actor on public.audit_logs(actor_user_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

-- Policy: admins can read all audit logs
create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('super_admin', 'admin')
    )
  );

-- Policy: any authenticated user can insert audit logs
create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert
  with check (auth.uid() is not null);

-- Function: automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Function: sync new auth.users to public.users on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url, auth_provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (id) do update set
    email       = excluded.email,
    full_name   = coalesce(excluded.full_name, public.users.full_name),
    avatar_url  = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at  = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
