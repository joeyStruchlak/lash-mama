// apps/web/src/features/calendar/components/AppointmentModal.tsx

import { Crown, MessageCircle, Gift, FileText } from 'lucide-react';
import { formatTime, getInitials } from '../utils/calendar.helpers';
import type { CalendarAppointment } from '../types/calendar.types';
import styles from '../Calendar.module.css';

interface AppointmentModalProps {
  appointment: CalendarAppointment;
  note: string;
  saving: boolean;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  onClose: () => void;
  onMessageClient: (clientId: string, clientName: string) => void;
}

export function AppointmentModal({
  appointment,
  note,
  saving,
  onNoteChange,
  onSave,
  onClose,
  onMessageClient,
}: AppointmentModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Appointment Details</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.clientSection}>
            <div className={styles.clientHeaderModal}>
              <div style={{ position: 'relative' }}>
                {appointment.user?.avatar_url ? (
                  <img
                    src={appointment.user.avatar_url}
                    alt={appointment.user.full_name}
                    className={styles.clientAvatarLarge}
                  />
                ) : (
                  <div className={styles.clientAvatarPlaceholderLarge}>
                    {getInitials(appointment.user?.full_name || 'U')}
                  </div>
                )}
                {appointment.user?.is_vip && (
                  <div className={styles.vipBadgeLarge}>
                    <Crown size={16} />
                  </div>
                )}
              </div>
              <div>
                <h4 className={styles.modalClientName}>{appointment.user?.full_name}</h4>
                <p className={styles.modalServiceName}>{appointment.service?.name}</p>
                <p className={styles.modalTime}>{formatTime(appointment.appointment_time)}</p>
              </div>
            </div>
          </div>

          <div className={styles.notesSection}>
            <label className={styles.notesLabel}>Staff Notes</label>
            <textarea
              className={styles.notesTextarea}
              placeholder="Add private notes about this appointment..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.modalActionButton}
              onClick={() => {
                onMessageClient(appointment.user_id, appointment.user?.full_name || '');
                onClose();
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

          <button className={styles.saveNoteButton} onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
