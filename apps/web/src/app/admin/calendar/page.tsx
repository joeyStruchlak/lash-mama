// apps/web/src/app/admin/calendar/page.tsx

import { Calendar } from '@/features/calendar/Calendar';

/**
 * Admin Calendar Route
 * Thin shell - reuses Calendar feature with admin role
 */

export default function AdminCalendarPage() {
  return <Calendar role="admin" showFilters={true} showNewButton={true} />;
}
