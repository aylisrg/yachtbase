export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  API_CLIENT_MANAGER: 'api_client_manager',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
  api_client_manager: 'API Client Manager',
};

export const YACHT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  under_maintenance: 'Under Maintenance',
  sold: 'Sold',
  draft: 'Draft',
  archived: 'Archived',
};

export const YACHT_TYPE_LABELS: Record<string, string> = {
  motor: 'Motor Yacht',
  sailing: 'Sailing Yacht',
  catamaran: 'Catamaran',
  superyacht: 'Superyacht',
  other: 'Other',
};

export const MEDIA_COLLECTION_LABELS: Record<string, string> = {
  main: 'Main',
  gallery: 'Gallery',
  inbox: 'Inbox / Queue',
};

export const EXTERNAL_PLATFORMS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  internal: 'Internal',
  other: 'Other',
};

export const API_SCOPES = [
  'read:yachts',
  'read:media',
  'read:specifications',
  'read:locations',
  'write:yachts',
  'write:media',
] as const;

export const APP_NAME = 'YachtBase';
export const APP_VERSION = '0.1.0';
export const API_VERSION = 'v1';

export const DEFAULT_AUTH_PROVIDER = 'google';
