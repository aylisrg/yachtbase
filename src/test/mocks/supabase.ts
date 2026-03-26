import { vi } from 'vitest';

/**
 * Creates a chainable Supabase query builder mock.
 * Each method returns `this` so calls can be chained, with `single()` and
 * `maybeSingle()` returning the resolved promise.
 */
export function createQueryMock(resolvedValue: { data: unknown; error: unknown }) {
  const mock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    maybeSingle: vi.fn().mockResolvedValue(resolvedValue),
    then: undefined as unknown,
  };
  // Make it thenable so `await query` resolves to `resolvedValue`
  mock.then = (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve);
  return mock;
}

/**
 * Creates a Supabase client mock where `from()` returns a fresh query builder
 * each time. Pass a map of table name → resolved value to control per-table responses.
 */
export function createSupabaseMock(
  tableResponses: Record<string, { data: unknown; error: unknown }> = {},
  authUser: unknown = null
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authUser } }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      const response = tableResponses[table] ?? { data: null, error: null };
      return createQueryMock(response);
    }),
  };
}
