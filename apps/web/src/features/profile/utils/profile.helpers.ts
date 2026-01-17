// apps/web/src/features/profile/utils/profile.helpers.ts

/**
 * Profile Utilities
 * Pure functions for formatting and validation
 */

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9+\-\s()]{8,}$/;
  return phoneRegex.test(phone);
}

/**
 * Format field name for display
 */
export function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    display_name: 'Display Name',
    email: 'Email',
    phone: 'Phone',
    bio: 'Bio',
  };
  return fieldNames[field] || field;
}

/**
 * Dispatch custom event for header/global updates
 */
export function broadcastProfileUpdate(data: {
  display_name?: string;
  avatar_url?: string;
}): void {
  window.dispatchEvent(
    new CustomEvent('profileUpdate', {
      detail: data,
    })
  );
}