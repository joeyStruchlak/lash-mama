// apps/web/src/features/dashboard/utils/dashboard.helpers.ts

/**
 * Dashboard Utilities
 * Pure functions for formatting and display
 */

/**
 * Format time from HH:MM:SS to 12-hour format
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return 'Time TBD';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Calculate duration display
 */
export function calculateDuration(duration: string | null | undefined): string {
  if (!duration || typeof duration !== 'string') {
    return '2 hrs';
  }
  const match = duration.match(/(\d+\.?\d*)/);
  const hours = match ? parseFloat(match[1]) : 2;
  if (hours >= 1) {
    return `${hours} hrs`;
  } else {
    return `${hours * 60} min`;
  }
}

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
 * Format birthday for display
 */
export function formatBirthday(birthday: string | null): string {
  if (!birthday) return 'Not set';
  const date = new Date(birthday);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}