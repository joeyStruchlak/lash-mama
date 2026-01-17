// apps/web/src/app/staff/calendar/page.tsx

import { Calendar } from '@/features/calendar/Calendar';

/**
 * Staff Calendar Route
 * Thin shell - all logic is in the feature
 */

export default function StaffCalendarPage() {
  return <Calendar role="staff" />;
}