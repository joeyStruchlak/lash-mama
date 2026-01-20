// apps/web/src/features/dashboard/components/AppointmentCard.tsx

import { Crown, Star, Users, Cake, MessageCircle, Gift, FileText } from 'lucide-react';
import { formatTime, getInitials, formatBirthday } from '../utils/dashboard.helpers';
import type { DashboardAppointment } from '../types/dashboard.types';
import styles from '../Dashboard.module.css';

interface AppointmentCardProps {
  appointment: DashboardAppointment;
  onClick: () => void;
  onMessageClick: (clientId: string, clientName: string) => void;
}

export function AppointmentCard({
  appointment,
  onClick,
  onMessageClick,
}: AppointmentCardProps) {
  const isVip = appointment.user?.is_vip || false;
  const streak = appointment.user?.vip_streak || 0;
  const referrals = appointment.user?.referral_count || 0;
  const birthday = appointment.user?.birthday;
  const memberSince = appointment.user?.created_at
    ? new Date(appointment.user.created_at).getFullYear()
    : new Date().getFullYear();
  
  // Check if note exists
  const hasNote = appointment.notes && appointment.notes.trim().length > 0;

  return (
    <div className={styles.appointmentCard} onClick={onClick}>
      {/* Note Indicator - Only show if note exists */}
      {hasNote && (
        <span className={styles.noteBadge}>
          <FileText size={12} />
          Note
        </span>
      )}

      {/* Client Header */}
      <div className={styles.clientHeader}>
        <div style={{ position: 'relative' }}>
          {appointment.user?.avatar_url ? (
            <img
              src={appointment.user.avatar_url}
              alt={appointment.user.full_name}
              className={styles.clientAvatar}
            />
          ) : (
            <div className={styles.clientAvatarPlaceholder}>
              {getInitials(appointment.user?.full_name || 'U')}
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
            <span className={styles.clientName}>{appointment.user?.full_name}</span>
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

      {/* Service Display */}
      <div className={styles.serviceDisplay}>
        <Star size={16} className={styles.serviceIcon} />
        <span className={styles.serviceName}>{appointment.service?.name}</span>
        <span className={styles.serviceDuration}>
          {formatTime(appointment.appointment_time)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionButton} ${styles.messageButton}`}
          data-tooltip="Message"
          onClick={(e) => {
            e.stopPropagation();
            onMessageClick(appointment.user_id, appointment.user?.full_name || '');
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
}