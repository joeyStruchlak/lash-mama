// apps/web/src/features/hours/components/SuccessModal.tsx

import { CheckCircle } from 'lucide-react';
import styles from '../Hours.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.successModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.successModalIcon}>
          <div className={styles.successIconCircle}>
            <CheckCircle size={56} strokeWidth={2.5} />
          </div>
          <div className={styles.successConfetti}>
            <div className={styles.confettiPiece}></div>
            <div className={styles.confettiPiece}></div>
            <div className={styles.confettiPiece}></div>
            <div className={styles.confettiPiece}></div>
            <div className={styles.confettiPiece}></div>
            <div className={styles.confettiPiece}></div>
          </div>
        </div>

        <h3 className={styles.successModalTitle}>Request Submitted!</h3>
        <p className={styles.successModalText}>
          Your time off request has been sent to <strong>Lash Mama</strong> for approval.
          You'll be notified once it's reviewed.
        </p>

        <button className={styles.successOkButton} onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}