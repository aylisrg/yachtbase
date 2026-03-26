// User roles
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer' | 'api_client_manager';

// Yacht status
export type YachtStatus = 'active' | 'under_maintenance' | 'sold' | 'draft' | 'archived';

// Yacht type
export type YachtType = 'motor' | 'sailing' | 'catamaran' | 'superyacht' | 'other';

// Media collection type
export type MediaCollectionType = 'main' | 'gallery' | 'inbox';

// Media type
export type MediaType = 'photo' | 'video' | 'external_video';

// Media source type
export type MediaSourceType = 'upload' | 'parsed' | 'external_link';

// External platform
export type ExternalPlatform = 'youtube' | 'instagram' | 'tiktok' | 'internal' | 'other';

// Moderation status
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

// API key scopes
export type ApiScope =
  | 'read:yachts'
  | 'read:media'
  | 'read:specifications'
  | 'read:locations'
  | 'write:yachts'
  | 'write:media';

// Entities
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Yacht {
  id: string;
  slug: string;
  name: string;
  manufacturer: string | null;
  shipyard: string | null;
  model: string | null;
  yacht_type: YachtType;
  build_year: number | null;
  refit_year: number | null;
  description: string | null;
  status: YachtStatus;
  booking_calendar_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface YachtSpecifications {
  id: string;
  yacht_id: string;
  length_overall: number | null;
  beam: number | null;
  draft: number | null;
  gross_tonnage: number | null;
  cruising_speed: number | null;
  max_speed: number | null;
  range_nm: number | null;
  fuel_capacity: number | null;
  water_capacity: number | null;
  engine_details: string | null;
  cabins_count: number | null;
  berths_count: number | null;
  guests_sleeping: number | null;
  guests_cruising: number | null;
  crew_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface YachtLocation {
  id: string;
  yacht_id: string;
  country: string | null;
  region: string | null;
  port: string | null;
  marina: string | null;
  latitude: number | null;
  longitude: number | null;
  recorded_at: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface YachtWithDetails extends Yacht {
  specifications: YachtSpecifications | null;
  latest_location: YachtLocation | null;
}

export interface MediaAsset {
  id: string;
  yacht_id: string;
  collection_type: MediaCollectionType;
  media_type: MediaType;
  source_type: MediaSourceType;
  platform: ExternalPlatform;
  file_path: string | null;
  public_url: string | null;
  external_url: string | null;
  embed_url: string | null;
  preview_image_url: string | null;
  thumbnail_path: string | null;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  moderation_status: ModerationStatus;
  source_name: string | null;
  source_page_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ApiClient {
  id: string;
  name: string;
  contact_email: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

export interface ApiKey {
  id: string;
  api_client_id: string;
  key_prefix: string;
  key_hash: string;
  scopes: ApiScope[];
  rate_limit: number | null;
  expires_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  created_at: string;
}
