import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Yacht } from '@/types';

// ---------------------------------------------------------------------------
// Mock the yachts service so the route doesn't need a real Supabase client
// ---------------------------------------------------------------------------
vi.mock('@/lib/yachts', () => ({
  listYachts: vi.fn(),
}));

import { listYachts } from '@/lib/yachts';
import { GET } from './route';

const mockListYachts = vi.mocked(listYachts);

const SAMPLE_YACHTS: Yacht[] = [
  {
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
  },
];

describe('GET /api/v1/yachts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns status 200 with data and count', async () => {
    mockListYachts.mockResolvedValue(SAMPLE_YACHTS);

    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ data: SAMPLE_YACHTS, count: SAMPLE_YACHTS.length });
  });

  it('returns count 0 when there are no yachts', async () => {
    mockListYachts.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ data: [], count: 0 });
  });

  it('returns application/json content type', async () => {
    mockListYachts.mockResolvedValue(SAMPLE_YACHTS);

    const response = await GET();

    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
