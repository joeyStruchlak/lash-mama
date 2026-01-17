// apps/web/src/features/hours/components/TimeOffModal.tsx

import { Calendar } from 'lucide-react';
import type { TimeOffFormData } from '../types/hours.types';
import styles from '../Hours.module.css';

interface TimeOffModalProps {
  isOpen: boolean;
  formData: TimeOffFormData;
  onFormChange: (data: TimeOffFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function TimeOffModal({
  isOpen,
  formData,
  onFormChange,
  onSubmit,
  onClose,
}: TimeOffModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Request Time Off</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Start Date</label>
            <div className={styles.dateInputWrapper}>
              <Calendar size={20} className={styles.dateIcon} />
              <input
                type="date"
                className={styles.dateInput}
                value={formData.startDate}
                onChange={(e) => onFormChange({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>End Date</label>
            <div className={styles.dateInputWrapper}>
              <Calendar size={20} className={styles.dateIcon} />
              <input
                type="date"
                className={styles.dateInput}
                value={formData.endDate}
                onChange={(e) => onFormChange({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Reason *</label>
            <textarea
              className={styles.formTextarea}
              placeholder="Please explain the reason for your time off request..."
              value={formData.reason}
              onChange={(e) => onFormChange({ ...formData, reason: e.target.value })}
              rows={4}
              required
            />
          </div>

          <button className={styles.submitButton} onClick={onSubmit}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
