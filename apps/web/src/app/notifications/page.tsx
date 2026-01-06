'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { markAsRead, markAllAsRead, deleteNotification } from '@/lib/notifications';
import type { NotificationWithDetails } from '@/types/notification';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  async function fetchNotifications(): Promise<void> {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let query = supabase
        .from('notifications')
        .select(`
          *,
          appointment:related_appointment_id(
            appointment_date,
            appointment_time,
            services:service_id(name),
            staff:staff_id(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id: string): Promise<void> {
    await markAsRead(id);
    fetchNotifications();
  }

  async function handleMarkAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await markAllAsRead(user.id);
      fetchNotifications();
    }
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteNotification(id);
    fetchNotifications();
  }

  function getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      booking_confirmed: '🎉',
      payment_received: '✅',
      reminder_24h: '⏰',
      reminder_2h: '🔔',
      booking_cancelled: '❌',
      vip_achieved: '🌟',
      general: '📬',
    };
    return icons[type] || '📬';
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Notifications
          </h1>
          <p className="text-[#3D3D3D]">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-[#C9A871] text-white'
                  : 'bg-gray-100 text-[#3D3D3D] hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'unread'
                  ? 'bg-[#C9A871] text-white'
                  : 'bg-gray-100 text-[#3D3D3D] hover:bg-gray-200'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-[#C9A871] hover:bg-[#F5F2EF] rounded-lg transition font-medium"
            >
              <CheckCheck size={18} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-[#3D3D3D] text-lg">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {filter === 'unread' 
                ? "You're all caught up!"
                : "We'll notify you about bookings, reminders, and more"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200 ${
                  !notification.is_read ? 'border-l-4 border-[#C9A871]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-[#2A2A2A]">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>

                    <p className="text-[#3D3D3D] text-sm mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#F5F2EF] text-[#C9A871] rounded-lg hover:bg-[#C9A871] hover:text-white transition font-medium"
                        >
                          <Check size={14} />
                          Mark read
                        </button>
                      )}

                      {notification.related_appointment_id && (
                        <button
                          onClick={() => router.push('/vip')}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-[#3D3D3D] rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                          View Booking
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="ml-auto p-1.5 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}