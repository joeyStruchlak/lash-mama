// apps/web/src/features/messages/hooks/useTyping.ts

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * useTyping Hook
 * Manages typing indicator state
 */

export function useTyping(conversationId: string | null, currentUserId: string) {
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  function subscribeToTyping(convId: string) {
    const channel = supabase.channel(`room-${convId}`, {
      config: { broadcast: { self: false }, presence: { key: currentUserId } },
    });

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async function handleTyping() {
    if (!conversationId || !currentUserId) return;
    const channel = supabase.channel(`room-${conversationId}`);
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUserId, is_typing: true },
    });
  }

  return {
    otherUserTyping,
    handleTyping,
    subscribeToTyping,
  };
}