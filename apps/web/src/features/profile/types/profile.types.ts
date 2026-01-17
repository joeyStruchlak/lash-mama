// apps/web/src/features/profile/types/profile.types.ts

/**
 * Profile Types
 * Aligned with Supabase schema: users + staff tables
 */

export type ProfileRole = 'user' | 'vip' | 'staff' | 'manager' | 'admin';

export interface ProfileData {
  // From users table
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  created_at: string;

  // From staff table (when role is staff/manager/admin)
  display_name?: string;
  title?: string;
  specialty?: string;
  bio?: string;
  location?: string;
  tier?: string;
}

export interface ProfileFormData {
  display_name: string;
  email: string;
  phone: string;
  bio: string;
}

export type EditableField = 'display_name' | 'email' | 'phone' | 'bio';

export interface ProfileUpdatePayload {
  field: EditableField;
  value: string;
  userId: string;
}

export interface PhotoUploadResult {
  url: string;
  path: string;
}

export interface ProfileProps {
  role: ProfileRole;
  userId?: string;
  canEdit?: boolean;
}
