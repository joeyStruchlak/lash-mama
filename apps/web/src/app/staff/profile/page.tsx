// apps/web/src/app/staff/profile/page.tsx

import { Profile } from '@/features/profile/Profile';

/**
 * Staff Profile Route
 * Thin shell - all logic is in the feature
 */

export default function StaffProfilePage() {
  return <Profile role="staff" />;
}