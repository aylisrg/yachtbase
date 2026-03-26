import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasMinimumRole, getAuthUser } from './auth';
import { createSupabaseMock } from '@/test/mocks/supabase';

// ---------------------------------------------------------------------------
// Mock @/lib/supabase/server so tests run without a real Supabase instance
// ---------------------------------------------------------------------------
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
const mockCreateClient = vi.mocked(createClient);

// ---------------------------------------------------------------------------
// hasMinimumRole
// ---------------------------------------------------------------------------
describe('hasMinimumRole', () => {
  it('viewer meets viewer', () => {
    expect(hasMinimumRole('viewer', 'viewer')).toBe(true);
  });

  it('viewer does not meet editor', () => {
    expect(hasMinimumRole('viewer', 'editor')).toBe(false);
  });

  it('super_admin meets all roles', () => {
    expect(hasMinimumRole('super_admin', 'viewer')).toBe(true);
    expect(hasMinimumRole('super_admin', 'admin')).toBe(true);
    expect(hasMinimumRole('super_admin', 'super_admin')).toBe(true);
  });

  it('admin meets editor but not super_admin', () => {
    expect(hasMinimumRole('admin', 'editor')).toBe(true);
    expect(hasMinimumRole('admin', 'super_admin')).toBe(false);
  });

  it('editor meets viewer and editor', () => {
    expect(hasMinimumRole('editor', 'viewer')).toBe(true);
    expect(hasMinimumRole('editor', 'editor')).toBe(true);
  });

  it('api_client_manager is between editor and admin', () => {
    expect(hasMinimumRole('api_client_manager', 'editor')).toBe(true);
    expect(hasMinimumRole('api_client_manager', 'admin')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAuthUser
// ---------------------------------------------------------------------------
describe('getAuthUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when there is no session', async () => {
    mockCreateClient.mockResolvedValue(
      createSupabaseMock({}, null) as ReturnType<typeof createSupabaseMock>
    );

    const result = await getAuthUser();
    expect(result).toBeNull();
  });

  it('returns AuthUser from DB profile when session and profile exist', async () => {
    const authUser = { id: 'user-1', email: 'test@example.com', user_metadata: {} };
    const profile = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      full_name: 'Test User',
      avatar_url: null,
      is_active: true,
    };

    mockCreateClient.mockResolvedValue(
      createSupabaseMock({ users: { data: profile, error: null } }, authUser) as ReturnType<typeof createSupabaseMock>
    );

    const result = await getAuthUser();
    expect(result).toEqual(profile);
    expect(result?.role).toBe('admin');
  });

  it('returns fallback AuthUser with role viewer when profile is not found', async () => {
    const authUser = {
      id: 'user-2',
      email: 'new@example.com',
      user_metadata: { full_name: 'New User', avatar_url: 'https://example.com/avatar.png' },
    };

    mockCreateClient.mockResolvedValue(
      createSupabaseMock({ users: { data: null, error: null } }, authUser) as ReturnType<typeof createSupabaseMock>
    );

    const result = await getAuthUser();
    expect(result).not.toBeNull();
    expect(result?.id).toBe('user-2');
    expect(result?.role).toBe('viewer');
    expect(result?.is_active).toBe(true);
    expect(result?.full_name).toBe('New User');
    expect(result?.avatar_url).toBe('https://example.com/avatar.png');
  });

  it('falls back to user_metadata.name when full_name is absent', async () => {
    const authUser = {
      id: 'user-3',
      email: 'oauth@example.com',
      user_metadata: { name: 'OAuth Name' },
    };

    mockCreateClient.mockResolvedValue(
      createSupabaseMock({ users: { data: null, error: null } }, authUser) as ReturnType<typeof createSupabaseMock>
    );

    const result = await getAuthUser();
    expect(result?.full_name).toBe('OAuth Name');
  });

  it('returns null full_name and avatar_url when user_metadata is empty', async () => {
    const authUser = {
      id: 'user-4',
      email: 'bare@example.com',
      user_metadata: {},
    };

    mockCreateClient.mockResolvedValue(
      createSupabaseMock({ users: { data: null, error: null } }, authUser) as ReturnType<typeof createSupabaseMock>
    );

    const result = await getAuthUser();
    expect(result?.full_name).toBeNull();
    expect(result?.avatar_url).toBeNull();
  });
});
