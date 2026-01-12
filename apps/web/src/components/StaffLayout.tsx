'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Calendar, BarChart3, MessageCircle, FileText, User } from 'lucide-react';
import Link from 'next/link';
import styles from './StaffLayout.module.css';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const pathname = usePathname();
  const [firstName, setFirstName] = useState('');
  const [stats, setStats] = useState({ today: 0, week: 0 });
  const [unreadMessages] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const cachedStats = sessionStorage.getItem('staff_header_stats');
      if (cachedStats) {
        const data = JSON.parse(cachedStats);
        setFirstName(data.firstName);
        setStats(data.stats);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const name = userProfile?.full_name?.split(' ')[0] || '';
      setFirstName(name);

      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (staffProfile) {
        const today = new Date().toISOString().split('T')[0];
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, appointment_date')
          .eq('staff_id', staffProfile.id);

        if (appointments) {
          const todayCount = appointments.filter(apt => apt.appointment_date === today).length;
          const weekCount = appointments.filter(apt =>
            apt.appointment_date >= startOfWeek.toISOString().split('T')[0]
          ).length;

          const newStats = { today: todayCount, week: weekCount };
          setStats(newStats);

          sessionStorage.setItem('staff_header_stats', JSON.stringify({
            firstName: name,
            stats: newStats
          }));
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

const navItems = [
  { icon: CalendarDays, label: 'Dashboard', path: '/staff' },
  { icon: Calendar, label: 'Calendar', path: '/staff/calendar' },
  { icon: BarChart3, label: 'Analytics', path: '/staff/hours' },
  { icon: MessageCircle, label: 'Messages', path: '/staff/messages', badge: unreadMessages },
  { icon: FileText, label: 'Notes', path: '/staff/notes' },
  { icon: User, label: 'Profile', path: '/staff/profile' }
];
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerCard}>
          <div className={styles.headerTop}>
            <div className={styles.headerIcon}>
              <CalendarDays size={36} color="white" />
            </div>
            <div className={styles.headerText}>
              <p className={styles.headerSubtitle}>
                Welcome back{firstName && `, ${firstName}`}
              </p>
              <h1 className={styles.headerTitle}>
                Staff Dashboard
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{stats.today}</p>
              <p className={styles.statLabel}>Today's Appointments</p>
            </div>

            <div className={styles.statCard}>
              <p className={styles.statValue}>{stats.week}</p>
              <p className={styles.statLabel}>This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className={styles.contentWrapper}>
        <div className={styles.contentGrid}>
          {/* Sidebar */}
          <nav className={styles.sidebar}>
            {navItems.map((item, i) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={i}
                  href={item.path}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  <item.icon size={20} />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className={styles.navBadge}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Main Content */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}