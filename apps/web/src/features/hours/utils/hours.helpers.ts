// apps/web/src/features/hours/utils/hours.helpers.ts

import type { WeeklySchedule } from '../types/hours.types';

/**
 * Hours Utilities
 * Pure functions for formatting and calculations
 */

/**
 * Get initials from name
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
 * Format date
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format date range
 */
export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Calculate weekly hours from schedule
 */
export function calculateWeeklyHours(schedule: WeeklySchedule): number {
  return Object.values(schedule).reduce((total, day) => {
    const start = parseTime(day.start);
    const end = parseTime(day.end);
    return total + (end - start);
  }, 0);
}

/**
 * Parse time string to hours (decimal)
 */
function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour = hours;
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour + minutes / 60;
}

/**
 * Calculate months employed
 */
export function calculateMonthsEmployed(startDate: string): string {
  if (!startDate) return '0m';

  const start = new Date(startDate);
  const now = new Date();

  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

  if (months < 12) return `${months}m`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) return `${years}y`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Get milestone icon component
 */
export function getMilestoneIconName(icon: string): string {
  const iconMap: Record<string, string> = {
    users: 'Users',
    star: 'Star',
    trophy: 'Trophy',
    target: 'Target',
    gift: 'Gift',
    sparkles: 'Sparkles',
  };
  return iconMap[icon] || 'Trophy';
}
