// apps/web/src/app/staff/hours/page.tsx

import { Hours } from '@/features/hours/Hours';

/**
 * Staff Hours Route
 * Thin shell - all logic is in the feature
 */

export default function StaffHoursPage() {
  return <Hours role="staff" title="My Hours" />;
}
