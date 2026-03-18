import { createClient } from '@/lib/supabase/server';
import type { Yacht, YachtWithDetails } from '@/types';

/**
 * List yachts visible to the current session.
 * Unauthenticated callers see only active yachts (enforced by RLS).
 * Admins/editors see all statuses.
 */
export async function listYachts(): Promise<Yacht[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('yachts')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[yachts] listYachts error:', error.message);
    return [];
  }

  return (data ?? []) as Yacht[];
}

/**
 * Retrieve a single yacht by its UUID or slug.
 * Returns null when not found or not accessible via RLS.
 */
export async function getYacht(idOrSlug: string): Promise<Yacht | null> {
  const supabase = await createClient();

  // Determine whether the lookup value looks like a UUID.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  const query = supabase.from('yachts').select('*');
  const { data, error } = await (isUuid
    ? query.eq('id', idOrSlug)
    : query.eq('slug', idOrSlug)
  ).single();

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = "not found" — anything else is unexpected
      console.error('[yachts] getYacht error:', error.message);
    }
    return null;
  }

  return data as Yacht;
}

/**
 * Retrieve a yacht together with its specifications and most recent location.
 * Returns null when not found or not accessible via RLS.
 */
export async function getYachtWithDetails(
  idOrSlug: string
): Promise<YachtWithDetails | null> {
  const yacht = await getYacht(idOrSlug);
  if (!yacht) return null;

  const supabase = await createClient();

  const [{ data: specs }, { data: locations }] = await Promise.all([
    supabase
      .from('yacht_specifications')
      .select('*')
      .eq('yacht_id', yacht.id)
      .maybeSingle(),
    supabase
      .from('yacht_locations')
      .select('*')
      .eq('yacht_id', yacht.id)
      .order('recorded_at', { ascending: false })
      .limit(1),
  ]);

  return {
    ...yacht,
    specifications: specs ?? null,
    latest_location: locations?.[0] ?? null,
  };
}
