// apps/web/src/app/admin/profile/page.tsx

import { Profile } from '@/features/profile/Profile';

/**
 * Admin Profile Route
 * Thin shell - reuses Profile feature with admin role
 */

export default function AdminProfilePage() {
  return <Profile role="admin" canEdit={true} />;
}
