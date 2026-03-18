-- Fix 1: Add a security-definer helper to safely read the current user's role.
-- Using a sub-query back to public.users inside an RLS policy on public.users
-- risks infinite recursion. This function bypasses RLS and is safe to call from policies.
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- Fix 2: Replace the admin-check policies that had the recursive sub-query pattern
-- with ones that call current_user_role() instead.
drop policy if exists "Admins can read all users" on public.users;
create policy "Admins can read all users"
  on public.users for select
  using (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "Super admins can update users" on public.users;
create policy "Super admins can update users"
  on public.users for update
  using (public.current_user_role() = 'super_admin');

drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (public.current_user_role() in ('super_admin', 'admin'));

-- Fix 3: Add a missing INSERT policy on public.users.
-- The handle_new_user trigger (security definer) handles the initial row creation,
-- but the safety-net upsert in /auth/callback runs as the authenticated user and
-- requires an explicit INSERT policy to succeed under RLS.
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);
