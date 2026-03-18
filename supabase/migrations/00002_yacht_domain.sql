-- Migration: Yacht domain tables + auth/RLS fixes
-- Fixes:
--   1. Recursive RLS policies on public.users replaced with a security-definer helper
--   2. INSERT policy added for public.users (trigger path + super_admin path)
-- New tables:
--   public.yachts
--   public.yacht_specifications
--   public.yacht_locations

-- ============================================================
-- 1. Fix recursive RLS on public.users
-- ============================================================

-- Helper function: returns the role of the current authenticated user
-- without triggering RLS (SECURITY DEFINER bypasses row-level policies).
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid()
$$;

-- Drop the recursion-prone admin-read policy and replace it.
drop policy if exists "Admins can read all users" on public.users;

create policy "Admins can read all users"
  on public.users for select
  using (public.current_user_role() in ('super_admin', 'admin'));

-- Drop the recursion-prone super_admin update policy and replace it.
drop policy if exists "Super admins can update users" on public.users;

create policy "Super admins can update users"
  on public.users for update
  using (public.current_user_role() = 'super_admin');

-- INSERT policy: allow the trigger function (security definer, bypasses RLS)
-- and super_admins to insert rows directly.
drop policy if exists "Allow trigger to insert users" on public.users;

create policy "Allow trigger to insert users"
  on public.users for insert
  with check (
    -- The handle_new_user trigger runs as security definer (postgres role),
    -- so it bypasses RLS entirely. This policy covers any direct inserts
    -- from the app layer (e.g. manual user provisioning by super_admin).
    auth.uid() = id
    or public.current_user_role() = 'super_admin'
  );

-- Also fix the recursive pattern in audit_logs policies.
drop policy if exists "Admins can read audit logs" on public.audit_logs;

create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (public.current_user_role() in ('super_admin', 'admin'));

-- ============================================================
-- 2. Yacht domain enums
-- ============================================================

create type public.yacht_status as enum (
  'draft',
  'active',
  'under_maintenance',
  'sold',
  'archived'
);

create type public.yacht_type as enum (
  'motor',
  'sailing',
  'catamaran',
  'superyacht',
  'other'
);

-- ============================================================
-- 3. public.yachts
-- ============================================================

create table public.yachts (
  id                    uuid primary key default uuid_generate_v4(),
  slug                  text not null unique,
  name                  text not null,
  manufacturer          text,
  shipyard              text,
  model                 text,
  yacht_type            public.yacht_type not null default 'motor',
  build_year            smallint,
  refit_year            smallint,
  description           text,
  status                public.yacht_status not null default 'draft',
  booking_calendar_url  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references public.users(id) on delete set null,
  updated_by            uuid references public.users(id) on delete set null
);

create index idx_yachts_slug   on public.yachts(slug);
create index idx_yachts_status on public.yachts(status);
create index idx_yachts_type   on public.yachts(yacht_type);

create trigger on_yachts_updated
  before update on public.yachts
  for each row execute function public.handle_updated_at();

alter table public.yachts enable row level security;

-- Public read of active yachts (anon + authenticated)
create policy "Public can read active yachts"
  on public.yachts for select
  using (status = 'active');

-- Admins and editors can read all yachts regardless of status
create policy "Admins and editors can read all yachts"
  on public.yachts for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Editors and above can insert yachts
create policy "Editors can insert yachts"
  on public.yachts for insert
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Editors and above can update yachts
create policy "Editors can update yachts"
  on public.yachts for update
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Only admins can delete yachts
create policy "Admins can delete yachts"
  on public.yachts for delete
  using (public.current_user_role() in ('super_admin', 'admin'));

-- ============================================================
-- 4. public.yacht_specifications
-- ============================================================

create table public.yacht_specifications (
  id                uuid primary key default uuid_generate_v4(),
  yacht_id          uuid not null unique references public.yachts(id) on delete cascade,
  -- Dimensions (meters)
  length_overall    numeric(7, 2),
  beam              numeric(6, 2),
  draft             numeric(5, 2),
  -- Tonnage
  gross_tonnage     numeric(9, 2),
  -- Performance (knots / nm)
  cruising_speed    numeric(5, 2),
  max_speed         numeric(5, 2),
  range_nm          integer,
  -- Capacities (litres)
  fuel_capacity     integer,
  water_capacity    integer,
  -- Propulsion
  engine_details    text,
  -- Accommodation
  cabins_count      smallint,
  berths_count      smallint,
  guests_sleeping   smallint,
  guests_cruising   smallint,
  crew_count        smallint,
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger on_yacht_specifications_updated
  before update on public.yacht_specifications
  for each row execute function public.handle_updated_at();

alter table public.yacht_specifications enable row level security;

-- Public can read specs for active yachts
create policy "Public can read active yacht specs"
  on public.yacht_specifications for select
  using (
    exists (
      select 1 from public.yachts y
      where y.id = yacht_id
        and y.status = 'active'
    )
  );

-- Admins and editors can read all specs
create policy "Admins and editors can read all yacht specs"
  on public.yacht_specifications for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Editors and above can insert / update / delete specs
create policy "Editors can insert yacht specs"
  on public.yacht_specifications for insert
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "Editors can update yacht specs"
  on public.yacht_specifications for update
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete yacht specs"
  on public.yacht_specifications for delete
  using (public.current_user_role() in ('super_admin', 'admin'));

-- ============================================================
-- 5. public.yacht_locations
-- ============================================================

create table public.yacht_locations (
  id            uuid primary key default uuid_generate_v4(),
  yacht_id      uuid not null references public.yachts(id) on delete cascade,
  country       text,
  region        text,
  port          text,
  marina        text,
  latitude      numeric(9, 6),
  longitude     numeric(9, 6),
  recorded_at   timestamptz not null default now(),
  source        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_yacht_locations_yacht_id    on public.yacht_locations(yacht_id);
create index idx_yacht_locations_recorded_at on public.yacht_locations(recorded_at desc);

create trigger on_yacht_locations_updated
  before update on public.yacht_locations
  for each row execute function public.handle_updated_at();

alter table public.yacht_locations enable row level security;

-- Public can read locations for active yachts
create policy "Public can read active yacht locations"
  on public.yacht_locations for select
  using (
    exists (
      select 1 from public.yachts y
      where y.id = yacht_id
        and y.status = 'active'
    )
  );

-- Admins and editors can read all locations
create policy "Admins and editors can read all yacht locations"
  on public.yacht_locations for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Editors and above can insert / update / delete locations
create policy "Editors can insert yacht locations"
  on public.yacht_locations for insert
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "Editors can update yacht locations"
  on public.yacht_locations for update
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "Admins can delete yacht locations"
  on public.yacht_locations for delete
  using (public.current_user_role() in ('super_admin', 'admin'));
