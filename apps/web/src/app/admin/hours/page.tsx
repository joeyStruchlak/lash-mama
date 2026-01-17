// apps/web/src/app/admin/hours/page.tsx

import { Hours } from '@/features/hours/Hours';

/**
 * Admin Hours Route
 * Thin shell - reuses Hours feature with admin role
 */

export default function AdminHoursPage() {
  return <Hours role="admin" title="Staff Analytics" />;
}
