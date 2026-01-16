'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Bell, Calendar, Menu, X, Crown, Sparkles } from 'lucide-react';
import { getUnreadCount, markAllAsRead } from '@/lib/notifications';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/user';
import type { NotificationWithDetails } from '@/types/notification';
import styles from './Header.module.css';

interface UserProfile {
  role: UserRole;
  avatar_url: string | null;
  full_name?: string;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationWithDetails[]>([]);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserProfile(session.user.id);
        fetchUnreadCount(session.user.id);
        fetchRecentNotifications(session.user.id);
      } else {
        setUserProfile(null);
        setUnreadCount(0);
        setRecentNotifications([]);
      }
    });

    const handleAvatarUpdate = () => {
      console.log('🔄 Avatar updated');
      loadUser();
    };

    // ⚡ Listen for profile updates from Profile page
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('🔄 Profile updated, refreshing header...', event.detail);
      loadUser(); // Refetch fresh data from Supabase
    };

    window.addEventListener('avatar-updated', handleAvatarUpdate);
    window.addEventListener('profileUpdate', handleProfileUpdate as EventListener);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
      window.removeEventListener('profileUpdate', handleProfileUpdate as EventListener);
    };
  }, []);

  // Real-time notifications subscription
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchUnreadCount(user.id);
    fetchRecentNotifications(user.id);

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Refresh counts and notifications immediately
          fetchUnreadCount(user.id);
          fetchRecentNotifications(user.id);
        }
      )
      .subscribe((status) => {});

    // Also keep polling as backup (every 60 seconds instead of 30)
    const interval = setInterval(() => {
      fetchUnreadCount(user.id);
      fetchRecentNotifications(user.id);
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  async function loadUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadUserProfile(user.id);
        fetchUnreadCount(user.id);
        fetchRecentNotifications(user.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('users')
        .select('role, avatar_url, full_name')
        .eq('id', userId)
        .single();

      if (data) setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

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

  function getNotificationIcon(type: string) {
    const icons: { [key: string]: React.ReactNode } = {
      booking_confirmed: <Calendar size={20} />,
      payment_received: <Bell size={20} />,
      reminder_24h: <Bell size={20} />,
      reminder_2h: <Bell size={20} />,
      booking_cancelled: <X size={20} />,
      vip_achieved: <Crown size={20} />,
      general: <Bell size={20} />,
    };
    return icons[type] || <Bell size={20} />;
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

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const isVIP = userProfile?.role === 'vip';

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <nav className={styles.nav}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              Lash <span className={styles.logoAccent}>Mama</span>
            </Link>

            {/* Desktop Navigation - Centered with VIP Hero */}
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>
                Home
              </Link>
              <Link href="/services" className={styles.navLink}>
                Services
              </Link>
              <Link href="/book" className={styles.navLink}>
                Book Now
              </Link>

              {/* VIP Badge - CENTER HERO */}
              {user && isVIP ? (
                <Link href="/vip" className={styles.vipHeroBadge}>
                  <div className={styles.vipGlow} />
                  <Crown size={18} fill="currentColor" strokeWidth={0} />
                  <span className={styles.vipText}>VIP</span>
                  <Sparkles size={14} className={styles.vipSparkle} />
                </Link>
              ) : (
                <Link href="/vip" className={styles.vipHeroBadgeInactive}>
                  <Crown size={18} strokeWidth={1.5} />
                  <span>VIP</span>
                </Link>
              )}

              <Link href="/gallery" className={styles.navLink}>
                Gallery
              </Link>
              <Link href="/shop" className={styles.navLink}>
                Shop
              </Link>
              <Link href="/courses" className={styles.navLink}>
                Courses
              </Link>
            </div>

            {/* User Actions */}
            <div className={styles.userActions}>
              {user ? (
                <>
                  {/* Notification Bell */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className={styles.notificationButton}
                      onClick={async () => {
                        setShowNotifications(!showNotifications);

                        // Mark all as read when opening dropdown
                        if (!showNotifications && user && unreadCount > 0) {
                          await markAllAsRead(user.id);
                          fetchUnreadCount(user.id);
                          fetchRecentNotifications(user.id);
                        }
                      }}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className={styles.notificationBadge}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <>
                        <div
                          className={styles.dropdownOverlay}
                          onClick={() => setShowNotifications(false)}
                        />
                        <div className={styles.notificationDropdown}>
                          <div className={styles.notificationHeader}>
                            <h3 className={styles.notificationTitle}>Notifications</h3>
                            {unreadCount > 0 && (
                              <span className={styles.unreadCount}>{unreadCount} unread</span>
                            )}
                          </div>

                          <div className={styles.notificationList}>
                            {recentNotifications.length === 0 ? (
                              <div className={styles.notificationEmpty}>
                                <Bell size={32} className={styles.emptyIcon} />
                                <p className={styles.emptyText}>No notifications</p>
                              </div>
                            ) : (
                              recentNotifications.map((notification) => (
                                <Link
                                  key={notification.id}
                                  href="/notifications"
                                  onClick={() => setShowNotifications(false)}
                                  className={`${styles.notificationItem} ${
                                    !notification.is_read ? styles.notificationItemUnread : ''
                                  }`}
                                >
                                  <div className={styles.notificationIcon}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className={styles.notificationContent}>
                                    <p className={styles.notificationItemTitle}>
                                      {notification.title}
                                    </p>
                                    <p className={styles.notificationItemMessage}>
                                      {notification.message}
                                    </p>
                                    <p className={styles.notificationItemTime}>
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>

                          <div className={styles.notificationFooter}>
                            <Link
                              href="/notifications"
                              onClick={() => setShowNotifications(false)}
                              className={styles.viewAllLink}
                            >
                              View All Notifications
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className={styles.userProfileButton}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <div className={styles.userAvatar}>
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className={styles.avatarImage}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isVIP && (
                          <div className={styles.vipIndicator}>
                            <Crown size={10} fill="currentColor" strokeWidth={0} />
                          </div>
                        )}
                      </div>
                      <span className={styles.userName}>
                        {userProfile?.full_name?.split(' ')[0] ||
                          user.email?.split('@')[0] ||
                          'User'}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className={styles.dropdownArrow}
                      >
                        <path
                          d="M3 4.5L6 7.5L9 4.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div
                          className={styles.dropdownOverlay}
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className={styles.userDropdown}>
                          <div className={styles.userDropdownHeader}>
                            <div className={styles.userAvatar}>
                              {userProfile?.avatar_url ? (
                                <img
                                  src={userProfile.avatar_url}
                                  alt="Profile"
                                  className={styles.avatarImage}
                                />
                              ) : (
                                <div className={styles.avatarPlaceholder}>
                                  {user.email?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {isVIP && (
                                <div className={styles.vipIndicator}>
                                  <Crown size={10} fill="currentColor" strokeWidth={0} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={styles.dropdownUserName}>
                                {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
                              </p>
                              <p className={styles.dropdownUserEmail}>{user.email}</p>
                            </div>
                          </div>

                          <div className={styles.userDropdownDivider} />

                          <Link
                            href="/staff/profile"
                            className={styles.userDropdownItem}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            My Profile
                          </Link>

                          <Link
                            href="/staff"
                            className={styles.userDropdownItem}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            Dashboard
                          </Link>

                          <Link
                            href="/notifications"
                            className={styles.userDropdownItem}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Bell size={18} />
                            Notifications
                            {unreadCount > 0 && (
                              <span className={styles.dropdownBadge}>{unreadCount}</span>
                            )}
                          </Link>

                          <div className={styles.userDropdownDivider} />

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className={styles.userDropdownItemDanger}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className={styles.loginButton}>
                    Login
                  </Link>
                  <Link href="/signup" className={styles.signupButton}>
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className={styles.mobileMenuButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className={styles.mobileMenu}>
              <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link
                href="/services"
                className={styles.navLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link href="/book" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Book Now
              </Link>
              <Link href="/gallery" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Gallery
              </Link>
              <Link href="/shop" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/courses" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Courses
              </Link>

              {user && (
                <div className={styles.mobileUserSection}>
                  <div className={styles.mobileUserProfile}>
                    <div className={styles.userAvatar}>
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt="Profile"
                          className={styles.avatarImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isVIP && (
                        <div className={styles.vipIndicator}>
                          <Crown size={10} fill="currentColor" strokeWidth={0} />
                        </div>
                      )}
                    </div>
                    <p className={styles.mobileUserName}>{userProfile?.full_name || user.email}</p>
                  </div>

                  {unreadCount > 0 && (
                    <Link
                      href="/notifications"
                      className={styles.mobileNotificationLink}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell size={18} />
                      Notifications
                      <span className={styles.mobileBadge}>{unreadCount}</span>
                    </Link>
                  )}

                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                  </button>
                </div>
              )}

              {!user && (
                <div className={styles.mobileUserSection}>
                  <Link
                    href="/login"
                    className={styles.loginButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className={styles.signupButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
