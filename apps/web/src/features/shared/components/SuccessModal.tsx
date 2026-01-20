// apps/web/src/features/shared/components/SuccessModal.tsx

import { CheckCircle } from 'lucide-react';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.successModalOverlay} onClick={onClose}>
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

        <h3 className={styles.successModalTitle}>Note Saved!</h3>
        <p className={styles.successModalText}>
          Your appointment note has been saved successfully.
        </p>

        <button className={styles.successOkButton} onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}