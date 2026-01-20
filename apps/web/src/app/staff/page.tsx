// apps/web/src/app/staff/page.tsx

import { Dashboard } from '@/features/dashboard/Dashboard';

/**
 * Staff Dashboard Route
 * Thin shell - all logic is in the feature
 */

export default function StaffDashboardPage() {
  return <Dashboard role="staff" />;
}
