// apps/web/src/features/profile/components/SuccessModal.tsx

import { Check } from 'lucide-react';
import styles from '../Profile.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.successIcon}>
          <Check size={48} />
        </div>
        <h3 className={styles.modalTitle}>Profile Updated!</h3>
        <p className={styles.modalText}>
          Your changes have been sent to <strong>Lash Mama</strong> for approval.
        </p>
        <button className={styles.modalButton} onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}
