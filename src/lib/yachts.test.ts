import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listYachts, getYacht, getYachtWithDetails } from './yachts';
import type { Yacht, YachtSpecifications, YachtLocation } from '@/types';

// ---------------------------------------------------------------------------
// Mock @/lib/supabase/server
// ---------------------------------------------------------------------------
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
const mockCreateClient = vi.mocked(createClient);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSingleQueryMock(resolvedValue: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {};
  mock.select = vi.fn().mockReturnValue(mock);
  mock.eq = vi.fn().mockReturnValue(mock);
  mock.order = vi.fn().mockReturnValue(mock);
  mock.limit = vi.fn().mockReturnValue(mock);
  mock.single = vi.fn().mockResolvedValue(resolvedValue);
  mock.maybeSingle = vi.fn().mockResolvedValue(resolvedValue);
  // Make the mock itself await-able (for `.order().limit()` chains that return a promise)
  mock.then = (resolve: (v: unknown) => void) =>
    Promise.resolve(resolvedValue).then(resolve);
  return mock;
}

const SAMPLE_YACHT: Yacht = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  slug: 'sea-breeze',
  name: 'Sea Breeze',
  manufacturer: 'Ferretti',
  shipyard: null,
  model: 'CX 500',
  yacht_type: 'motor',
  build_year: 2020,
  refit_year: null,
  description: null,
  status: 'active',
  booking_calendar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  created_by: null,
  updated_by: null,
};

const SAMPLE_SPECS: YachtSpecifications = {
  id: 'spec-1',
  yacht_id: SAMPLE_YACHT.id,
  length_overall: 15.5,
  beam: 4.2,
  draft: 1.2,
  gross_tonnage: null,
  cruising_speed: 18,
  max_speed: 25,
  range_nm: 350,
  fuel_capacity: 1200,
  water_capacity: 400,
  engine_details: '2x 400hp Volvo',
  cabins_count: 3,
  berths_count: 6,
  guests_sleeping: 6,
  guests_cruising: 8,
  crew_count: 2,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const SAMPLE_LOCATION: YachtLocation = {
  id: 'loc-1',
  yacht_id: SAMPLE_YACHT.id,
  country: 'Italy',
  region: 'Amalfi Coast',
  port: 'Positano',
  marina: null,
  latitude: 40.6279,
  longitude: 14.4836,
  recorded_at: '2025-06-01T00:00:00Z',
  source: 'manual',
  created_at: '2025-06-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// listYachts
// ---------------------------------------------------------------------------
describe('listYachts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an array of yachts on success', async () => {
    const queryMock = makeSingleQueryMock({ data: [SAMPLE_YACHT], error: null });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await listYachts();
    expect(result).toEqual([SAMPLE_YACHT]);
  });

  it('returns [] when Supabase returns an error', async () => {
    const queryMock = makeSingleQueryMock({ data: null, error: { message: 'DB error' } });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await listYachts();
    expect(result).toEqual([]);
  });

  it('returns [] when data is null and there is no error', async () => {
    const queryMock = makeSingleQueryMock({ data: null, error: null });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await listYachts();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getYacht
// ---------------------------------------------------------------------------
describe('getYacht', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses eq("id", ...) for UUID inputs', async () => {
    const queryMock = makeSingleQueryMock({ data: SAMPLE_YACHT, error: null });
    const fromMock = vi.fn().mockReturnValue(queryMock);
    mockCreateClient.mockResolvedValue({ from: fromMock } as ReturnType<typeof createClient>);

    await getYacht('550e8400-e29b-41d4-a716-446655440000');

    expect(queryMock.eq).toHaveBeenCalledWith('id', '550e8400-e29b-41d4-a716-446655440000');
  });

  it('uses eq("slug", ...) for non-UUID inputs', async () => {
    const queryMock = makeSingleQueryMock({ data: SAMPLE_YACHT, error: null });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    await getYacht('sea-breeze');

    expect(queryMock.eq).toHaveBeenCalledWith('slug', 'sea-breeze');
  });

  it('returns the yacht data on success', async () => {
    const queryMock = makeSingleQueryMock({ data: SAMPLE_YACHT, error: null });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await getYacht(SAMPLE_YACHT.id);
    expect(result).toEqual(SAMPLE_YACHT);
  });

  it('returns null for PGRST116 (not found) error', async () => {
    const queryMock = makeSingleQueryMock({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await getYacht('nonexistent-slug');
    expect(result).toBeNull();
  });

  it('returns null for other errors', async () => {
    const queryMock = makeSingleQueryMock({ data: null, error: { code: 'PGRST500', message: 'server error' } });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await getYacht('some-slug');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getYachtWithDetails
// ---------------------------------------------------------------------------
describe('getYachtWithDetails', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when getYacht returns null', async () => {
    const queryMock = makeSingleQueryMock({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    mockCreateClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(queryMock),
    } as ReturnType<typeof createClient>);

    const result = await getYachtWithDetails('missing-yacht');
    expect(result).toBeNull();
  });

  it('returns YachtWithDetails with specifications: null when specs are not found', async () => {
    let callCount = 0;
    mockCreateClient.mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        // First call: getYacht
        return { from: vi.fn().mockReturnValue(makeSingleQueryMock({ data: SAMPLE_YACHT, error: null })) } as ReturnType<typeof createClient>;
      }
      // Second call: parallel specs + locations queries
      return {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'yacht_specifications') {
            return makeSingleQueryMock({ data: null, error: null });
          }
          // yacht_locations returns empty array via thenable
          const mock = makeSingleQueryMock({ data: [], error: null });
          return mock;
        }),
      } as ReturnType<typeof createClient>;
    });

    const result = await getYachtWithDetails(SAMPLE_YACHT.id);
    expect(result).not.toBeNull();
    expect(result?.specifications).toBeNull();
    expect(result?.latest_location).toBeNull();
  });

  it('returns YachtWithDetails with latest_location: null when no locations', async () => {
    let callCount = 0;
    mockCreateClient.mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        return { from: vi.fn().mockReturnValue(makeSingleQueryMock({ data: SAMPLE_YACHT, error: null })) } as ReturnType<typeof createClient>;
      }
      return {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'yacht_specifications') {
            return makeSingleQueryMock({ data: SAMPLE_SPECS, error: null });
          }
          return makeSingleQueryMock({ data: [], error: null });
        }),
      } as ReturnType<typeof createClient>;
    });

    const result = await getYachtWithDetails(SAMPLE_YACHT.id);
    expect(result?.latest_location).toBeNull();
    expect(result?.specifications).toEqual(SAMPLE_SPECS);
  });

  it('returns full YachtWithDetails when all data is present', async () => {
    let callCount = 0;
    mockCreateClient.mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        return { from: vi.fn().mockReturnValue(makeSingleQueryMock({ data: SAMPLE_YACHT, error: null })) } as ReturnType<typeof createClient>;
      }
      return {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'yacht_specifications') {
            return makeSingleQueryMock({ data: SAMPLE_SPECS, error: null });
          }
          return makeSingleQueryMock({ data: [SAMPLE_LOCATION], error: null });
        }),
      } as ReturnType<typeof createClient>;
    });

    const result = await getYachtWithDetails(SAMPLE_YACHT.id);
    expect(result).toMatchObject({
      ...SAMPLE_YACHT,
      specifications: SAMPLE_SPECS,
      latest_location: SAMPLE_LOCATION,
    });
  });
});
