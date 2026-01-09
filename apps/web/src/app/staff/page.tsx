'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Calendar, MessageCircle, Gift, FileText, Crown, Star, Users, Cake, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './StaffDashboard.module.css';

export default function StaffDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  async function fetchStaffData() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔐 Current user:', user.id, user.email);

      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!staffProfile) {
        alert('Staff profile not found');
        return;
      }

      console.log('👤 Staff profile ID:', staffProfile.id);

      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today date:', today);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
    *,
    service:service_id(name, duration),
    user:user_id(
      full_name, 
      avatar_url,
      is_vip,
      vip_streak,
      referral_count,
      birthday,
      created_at
    )
  `)
        .eq('staff_id', staffProfile.id)
        .eq('appointment_date', today)
        .eq('status', 'confirmed')
        .order('appointment_time', { ascending: true })
        .limit(10); // Changed from 5 to 10

      console.log('🔍 Query returned appointments:', appointments?.length || 0);
      console.log('📋 Raw appointments:', appointments);
      console.log('❌ Any errors?:', error);

      // For each appointment, get the user's last visit
      if (appointments) {
        const enrichedAppointments = await Promise.all(
          appointments.map(async (apt: any) => {
            console.log('✨ Processing:', apt.user?.full_name, 'Time:', apt.appointment_time);

            const { data: previousApts } = await supabase
              .from('appointments')
              .select('appointment_date')
              .eq('user_id', apt.user_id)
              .eq('status', 'completed')
              .lt('appointment_date', apt.appointment_date)
              .order('appointment_date', { ascending: false })
              .limit(1);

            return {
              ...apt,
              lastVisit: previousApts && previousApts.length > 0 ? previousApts[0].appointment_date : null
            };
          })
        );

        console.log('📅 FINAL enriched appointments:', enrichedAppointments);
        setUpcomingAppointments(enrichedAppointments);
      }
    } catch (err) {
      console.error('❌ ERROR fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function calculateDuration(duration: string | null | undefined): string {
    if (!duration || typeof duration !== 'string') {
      return '2 hrs';
    }
    const match = duration.match(/(\d+\.?\d*)/);
    const hours = match ? parseFloat(match[1]) : 2;
    if (hours >= 1) {
      return `${hours} hrs`;
    } else {
      return `${hours * 60} min`;
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function handleMessageClient(clientId: string, clientName: string) {
    router.push(`/staff/messages?clientId=${clientId}&clientName=${clientName}`);
  }

  function formatBirthday(birthday: string | null): string {
    if (!birthday) return 'Not set';
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatLastVisit(lastVisit: string | null): { text: string; isFirst: boolean } {
    if (!lastVisit) {
      return { text: '1st Visit', isFirst: true };
    }
    const date = new Date(lastVisit);
    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isFirst: false
    };
  }

  function toggleExpanded(aptId: string) {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(aptId)) {
        newSet.delete(aptId);
      } else {
        newSet.add(aptId);
      }
      return newSet;
    });
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.scheduleCard}>
        <div className={styles.scheduleHeader}>
          <div>
            <h2 className={styles.scheduleTitle}>
              Today's Schedule
            </h2>
            <p className={styles.scheduleSubtitle}>
              Your appointments for today
            </p>
          </div>
          <Link href="/staff/calendar" className={styles.viewCalendarButton}>
            <Calendar size={16} />
            View Calendar
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>No appointments today</p>
          </div>
        ) : (
          <div className={styles.appointmentsList}>
            {upcomingAppointments.map((apt: any) => {
              const isExpanded = expandedCards.has(apt.id);
              const isVip = apt.user?.is_vip || false;
              const streak = apt.user?.vip_streak || 0; // Changed from booking_streak
              const referrals = apt.user?.referral_count || 0;
              const birthday = apt.user?.birthday;
              const memberSince = apt.user?.created_at
                ? new Date(apt.user.created_at).getFullYear()
                : new Date().getFullYear();
              const lastVisitData = formatLastVisit(apt.lastVisit);

              return (
                <div
                  key={apt.id}
                  className={styles.appointmentCard}
                  onClick={() => toggleExpanded(apt.id)}
                >
                  <span className={`${styles.statusBadge} ${apt.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                    }`}>
                    {apt.status}
                  </span>

                  <button
                    className={styles.expandToggle}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(apt.id);
                    }}
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  >
                    <ChevronDown size={18} />
                  </button>

                  {/* Client Header */}
                  <div className={styles.clientHeader}>
                    <div style={{ position: 'relative' }}>
                      {apt.user?.avatar_url ? (
                        <img
                          src={apt.user.avatar_url}
                          alt={apt.user.full_name}
                          className={styles.clientAvatar}
                        />
                      ) : (
                        <div className={styles.clientAvatarPlaceholder}>
                          {getInitials(apt.user?.full_name || 'U')}
                        </div>
                      )}
                      {isVip && (
                        <div className={styles.vipBadge}>
                          <Crown size={16} />
                        </div>
                      )}
                    </div>

                    <div className={styles.clientInfo}>
                      <div className={styles.clientDetails}>
                        <div className={styles.clientName}>
                          {apt.user?.full_name}

                        </div>
                        <div className={styles.clientMeta}>
                          <span className={styles.metaItem}>
                            Member since {memberSince}
                          </span>
                          {isVip && (
                            <span className={styles.vipMetaBadge}>
                              <Crown size={12} fill="currentColor" />
                              VIP
                            </span>
                          )}
                          {streak > 0 && (
                            <span className={styles.streakBadge}>
                              <Star size={14} fill="currentColor" />
                              {streak} streak
                            </span>
                          )}
                          {referrals > 0 && (
                            <span className={styles.metaItem}>
                              <Users size={14} />
                              {referrals} referrals
                            </span>
                          )}
                          {birthday && (
                            <span className={styles.metaItem}>
                              <Cake size={14} />
                              Birthday: {formatBirthday(birthday)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Display */}
                  <div className={styles.serviceDisplay}>
                    <Star size={20} className={styles.serviceIcon} />
                    <span className={styles.serviceName}>{apt.service?.name}</span>
                    <span className={styles.serviceDuration}>
                      {calculateDuration(apt.service?.duration)}
                    </span>
                  </div>

                  {/* Stats Grid - Only show when expanded */}
                  {isExpanded && (
                    <>
                      <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                          <div className={styles.statValue}>{formatTime(apt.appointment_time)}</div>
                          <div className={styles.statLabel}>Appointment Time</div>
                        </div>
                        {streak > 0 && (
                          <div className={styles.statCard}>
                            <div className={styles.statValue}>{streak}</div>
                            <div className={styles.statLabel}>Booking Streak</div>
                          </div>
                        )}
                        {referrals > 0 && (
                          <div className={styles.statCard}>
                            <div className={styles.statValue}>{referrals}</div>
                            <div className={styles.statLabel}>Friends Referred</div>
                          </div>
                        )}
                        <div className={styles.statCard}>
                          {lastVisitData.isFirst ? (
                            <>
                              <div className={styles.statValue} style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Star size={18} fill="#C9A871" />
                                {lastVisitData.text}
                              </div>
                              <div className={styles.statLabel}>First Visit</div>
                            </>
                          ) : (
                            <>
                              <div className={styles.statValue} style={{ fontSize: '14px' }}>
                                {lastVisitData.text}
                              </div>
                              <div className={styles.statLabel}>Last Visit</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionButton} ${styles.aftercareButton}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Gift size={18} />
                          Aftercare
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.messageButton}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageClient(apt.user_id, apt.user?.full_name);
                          }}
                        >
                          <MessageCircle size={18} />
                          Message
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.formButton}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText size={18} />
                          Allergy Form
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}