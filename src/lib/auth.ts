import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

/**
 * Get the currently authenticated user with their app-level profile (including role).
 * Returns null if no session or user profile is not found.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, role, full_name, avatar_url, is_active')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // User exists in auth but not in public.users (edge case: trigger may not have fired yet)
    return {
      id: user.id,
      email: user.email ?? '',
      role: 'viewer',
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      is_active: true,
    };
  }

  return profile as AuthUser;
}

/** Role hierarchy: higher index = more privileged */
const ROLE_HIERARCHY: UserRole[] = [
  'viewer',
  'editor',
  'api_client_manager',
  'admin',
  'super_admin',
];

/**
 * Check if the given role meets or exceeds the minimum required role.
 */
export function hasMinimumRole(
  userRole: UserRole,
  minimumRole: UserRole
): boolean {
  return (
    ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole)
  );
}
