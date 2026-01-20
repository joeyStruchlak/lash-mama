// apps/web/src/features/messages/hooks/usePresence.ts

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * usePresence Hook
 * Manages online/offline status tracking
 */

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, []);

  function setupPresence(userId: string) {
    console.log('🟢 Setting up presence for user:', userId);

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('👥 Presence sync - Current state:', state);
        const online = new Set(Object.keys(state));
        console.log('🟢 Online users:', Array.from(online));
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('✅ User joined:', key);
        setOnlineUsers((prev) => {
          const updated = new Set([...prev, key]);
          console.log('🟢 Updated online users:', Array.from(updated));
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('❌ User left:', key);
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(key);
          console.log('🔴 Updated online users:', Array.from(updated));
          return updated;
        });
      })
      .subscribe(async (status) => {
        console.log('📡 Presence channel status:', status);

        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
          console.log('✅ Presence tracked:', presenceTrackStatus);
        }

        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Presence channel error');
        }
      });

    presenceChannelRef.current = channel;
  }

  return {
    onlineUsers,
    setupPresence,
  };
}