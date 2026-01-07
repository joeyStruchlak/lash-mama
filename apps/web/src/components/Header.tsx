'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '@/lib/notifications';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/user';
import type { NotificationWithDetails } from '@/types/notification';

interface UserProfile {
  role: UserRole;
  avatar_url: string | null;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationWithDetails[]>([]);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }

        setUser(user);

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, avatar_url')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profile) {
            setUserProfile(profile);
          }

          // Fetch notifications
          fetchUnreadCount(user.id);
          fetchRecentNotifications(user.id);
        }
      } catch (error) {
        console.error('Unexpected error in loadUser:', error);
      }
    }

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role, avatar_url')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (profile) {
            setUserProfile(profile);
          }

          // Fetch notifications
          fetchUnreadCount(session.user.id);
          fetchRecentNotifications(session.user.id);
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setUserProfile(null);
        setUnreadCount(0);
        setRecentNotifications([]);
      }
    });

    // Listen for avatar updates
    const handleAvatarUpdate = (): void => {
      loadUser();
    };

    window.addEventListener('avatar-updated', handleAvatarUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, []);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchUnreadCount(user.id);
        fetchRecentNotifications(user.id);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  async function fetchUnreadCount(userId: string) {
    const count = await getUnreadCount(userId);
    setUnreadCount(count);
  }

  async function fetchRecentNotifications(userId: string) {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
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

  function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const navItems = [
    { label: 'Book', href: '/book' },
    { label: 'Services', href: '/services' },
    { label: 'VIP', href: '/vip' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Shop', href: '/shop' },
    { label: 'Courses', href: '/courses' },
  ];

  const isVIP = userProfile?.role === 'vip';

  return (
    <>
      <header className="bg-white border-b border-gold-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-serif font-bold text-dark">
              Lash Mama
            </Link>

            <nav className="hidden md:flex gap-8 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-dark hover:text-gold-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center gap-4">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-dark hover:text-gold-600 transition"
                    >
                      <Bell size={24} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-100 border-2 border-gold-300">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-600 font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isVIP && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-gold-600 to-gold-500 rounded-full flex items-center justify-center text-xs border-2 border-white">
                        💎
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 border-2 border-gold-600 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-dark"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-dark hover:text-gold-600 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-gold-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-100 border-2 border-gold-300">
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold-600 font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {isVIP && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-gold-600 to-gold-500 rounded-full flex items-center justify-center text-xs border-2 border-white">
                          💎
                        </div>
                      )}
                    </div>
                    <p className="text-dark-secondary text-sm">{user.email}</p>
                  </div>
                  
                  {/* Mobile notifications link */}
                  {unreadCount > 0 && (
                    <Link
                      href="/notifications"
                      className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <Bell size={18} />
                        Notifications
                      </span>
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gold-200 space-y-3">
                  <Link
                    href="/login"
                    className="block text-center px-4 py-2 border-2 border-gold-600 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Notification Dropdown (Desktop) */}
      {showNotifications && user && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-dark">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-dark-secondary">{unreadCount} unread</p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-dark-secondary">
                  <Bell size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className={`block p-4 hover:bg-gold-50 transition border-b border-gray-100 ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-dark-secondary line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                href="/notifications"
                onClick={() => setShowNotifications(false)}
                className="text-sm text-gold-600 font-medium hover:underline"
              >
                View All Notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}