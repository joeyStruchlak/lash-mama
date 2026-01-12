'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Calendar, MessageCircle, Gift, FileText, Crown, Star, Users, Cake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './StaffDashboard.module.css';

export default function StaffDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true); const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchStaffData();
  }, []);

  async function fetchStaffData() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!staffProfile) {
        alert('Staff profile not found');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

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
        .limit(10);

      if (appointments) {
        const enrichedAppointments = await Promise.all(
          appointments.map(async (apt: any) => {
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

  function openAppointmentModal(apt: any) {
    setSelectedAppointment(apt);
    setNote(apt.notes || '');
    setShowModal(true);
  }

  async function handleSaveNote(appointmentId: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ notes: note })
        .eq('id', appointmentId);

      if (error) throw error;

      alert('Note saved successfully!');
      setShowModal(false);
      fetchStaffData();
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
  }

  function formatBirthday(birthday: string | null): string {
    if (!birthday) return 'Not set';
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            <h2 className={styles.scheduleTitle}>Today's Schedule</h2>
            <p className={styles.scheduleSubtitle}>Your appointments for today</p>
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
              const isVip = apt.user?.is_vip || false;
              const streak = apt.user?.vip_streak || 0;
              const referrals = apt.user?.referral_count || 0;
              const birthday = apt.user?.birthday;
              const memberSince = apt.user?.created_at
                ? new Date(apt.user.created_at).getFullYear()
                : new Date().getFullYear();

              return (
                <div key={apt.id} className={styles.appointmentCard} onClick={() => openAppointmentModal(apt)}>
                  <span className={`${styles.statusBadge} ${apt.status === 'confirmed' ? styles.statusConfirmed :
                    apt.status === 'cancelled' ? styles.statusCancelled :
                      styles.statusPending
                    }`}>
                    {apt.status}
                  </span>

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
                          <Crown size={12} />
                        </div>
                      )}
                    </div>

                    <div className={styles.clientInfo}>
                      <div className={styles.clientDetails}>
                        <span className={styles.clientName}>
                          {apt.user?.full_name}
                        </span>
                        {isVip && (
                          <span className={styles.vipMetaBadge}>
                            <Crown size={10} fill="currentColor" />
                            VIP
                          </span>
                        )}
                        {streak > 0 && (
                          <span className={styles.streakBadge}>
                            <Star size={10} fill="currentColor" />
                            {streak} streak
                          </span>
                        )}
                      </div>
                      <div className={styles.clientMeta}>
                        <span className={styles.metaItem}>
                          Member since {memberSince}
                        </span>
                        {referrals > 0 && (
                          <span className={styles.metaItem}>
                            <Users size={12} />
                            {referrals} referrals
                          </span>
                        )}
                        {birthday && (
                          <span className={styles.metaItem}>
                            <Cake size={12} />
                            {formatBirthday(birthday)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Display */}
                  <div className={styles.serviceDisplay}>
                    <Star size={16} className={styles.serviceIcon} />
                    <span className={styles.serviceName}>{apt.service?.name}</span>
                    <span className={styles.serviceDuration}>
                      {formatTime(apt.appointment_time)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionButton} ${styles.messageButton}`}
                      data-tooltip="Message"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageClient(apt.user_id, apt.user?.full_name);
                      }}
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.aftercareButton}`}
                      data-tooltip="Aftercare"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Gift size={18} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.formButton}`}
                      data-tooltip="Allergy Form"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Appointment Details</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.clientSection}>
                <div className={styles.clientHeaderModal}>
                  <div style={{ position: 'relative' }}>
                    {selectedAppointment.user?.avatar_url ? (
                      <img src={selectedAppointment.user.avatar_url} alt={selectedAppointment.user.full_name} className={styles.clientAvatarLarge} />
                    ) : (
                      <div className={styles.clientAvatarPlaceholderLarge}>
                        {getInitials(selectedAppointment.user?.full_name || 'U')}
                      </div>
                    )}
                    {selectedAppointment.user?.is_vip && (
                      <div className={styles.vipBadgeLarge}>
                        <Crown size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className={styles.modalClientName}>{selectedAppointment.user?.full_name}</h4>
                    <p className={styles.modalServiceName}>{selectedAppointment.service?.name}</p>
                    <p className={styles.modalTime}>{formatTime(selectedAppointment.appointment_time)}</p>
                  </div>
                </div>
              </div>

              <div className={styles.notesSection}>
                <label className={styles.notesLabel}>Staff Notes</label>
                <textarea
                  className={styles.notesTextarea}
                  placeholder="Add private notes about this appointment..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.modalActionButton}
                  onClick={() => {
                    handleMessageClient(selectedAppointment.user_id, selectedAppointment.user?.full_name);
                    setShowModal(false);
                  }}
                >
                  <MessageCircle size={18} />
                  Message
                </button>
                <button className={styles.modalActionButton}>
                  <Gift size={18} />
                  Aftercare
                </button>
                <button className={styles.modalActionButton}>
                  <FileText size={18} />
                  Allergy Form
                </button>
              </div>

              <button
                className={styles.saveNoteButton}
                onClick={() => handleSaveNote(selectedAppointment.id)}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}