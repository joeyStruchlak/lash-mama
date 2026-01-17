// apps/web/src/features/calendar/components/CalendarDayView.tsx

import { Crown, Star, Users, Cake, MessageCircle, Gift, FileText } from 'lucide-react';
import {
  getAppointmentsForDate,
  formatTime,
  getInitials,
  formatBirthday,
} from '../utils/calendar.helpers';
import type { CalendarAppointment } from '../types/calendar.types';
import styles from '../Calendar.module.css';

interface CalendarDayViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onMessageClient: (clientId: string, clientName: string) => void;
}

export function CalendarDayView({
  currentDate,
  appointments,
  onAppointmentClick,
  onMessageClient,
}: CalendarDayViewProps) {
  const dayAppointments = getAppointmentsForDate(appointments, currentDate);

  if (dayAppointments.length === 0) {
    return (
      <div className={styles.dayView}>
        <p className={styles.emptyDayText}>No appointments scheduled</p>
      </div>
    );
  }

  return (
    <div className={styles.dayView}>
      <div className={styles.appointmentsList}>
        {dayAppointments.map((apt) => {
          const isVip = apt.user?.is_vip || false;
          const streak = apt.user?.vip_streak || 0;
          const referrals = apt.user?.referral_count || 0;
          const birthday = apt.user?.birthday;
          const memberSince = apt.user?.created_at
            ? new Date(apt.user.created_at).getFullYear()
            : new Date().getFullYear();

          return (
            <div
              key={apt.id}
              className={styles.appointmentCard}
              onClick={() => onAppointmentClick(apt)}
            >
              <span
                className={`${styles.statusBadge} ${
                  apt.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                }`}
              >
                {apt.status}
              </span>

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
                    <span className={styles.clientName}>{apt.user?.full_name}</span>
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
                    <span className={styles.metaItem}>Member since {memberSince}</span>
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

              <div className={styles.serviceDisplay}>
                <Star size={16} className={styles.serviceIcon} />
                <span className={styles.serviceName}>{apt.service?.name}</span>
                <span className={styles.serviceDuration}>{formatTime(apt.appointment_time)}</span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionButton} ${styles.messageButton}`}
                  data-tooltip="Message"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageClient(apt.user_id, apt.user?.full_name || '');
                  }}
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.aftercareButton}`}
                  data-tooltip="Aftercare"
                >
                  <Gift size={18} />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.formButton}`}
                  data-tooltip="Allergy Form"
                >
                  <FileText size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
