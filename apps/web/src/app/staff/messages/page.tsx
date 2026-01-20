// apps/web/src/app/staff/messages/page.tsx

import { Messages } from '@/features/messages/Messages';

/**
 * Staff Messages Route
 * Thin shell - all logic is in the feature
 */

export default function StaffMessagesPage() {
  return <Messages role="staff" />;
}