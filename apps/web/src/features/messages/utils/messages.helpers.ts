// apps/web/src/features/messages/utils/messages.helpers.ts

import type { User } from '../types/messages.types';

/**
 * Messages Utilities
 * Pure functions for formatting and display
 */

/**
 * Format timestamp for conversation list
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format message timestamp
 */
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get avatar gradient color based on name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, hsl(340 82% 85%) 0%, hsl(340 82% 75%) 100%)',
    'linear-gradient(135deg, hsl(217 91% 85%) 0%, hsl(217 91% 75%) 100%)',
    'linear-gradient(135deg, hsl(142 76% 85%) 0%, hsl(142 76% 75%) 100%)',
    'linear-gradient(135deg, hsl(37 91% 85%) 0%, hsl(37 91% 75%) 100%)',
    'linear-gradient(135deg, hsl(271 76% 85%) 0%, hsl(271 76% 75%) 100%)',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Check if user is VIP
 */
export function isVIP(user?: User): boolean {
  return (user?.vip_streak ?? 0) >= 10 || user?.role === 'vip';
}