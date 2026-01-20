// apps/web/src/features/shared/components/ErrorModal.tsx

import { XCircle } from 'lucide-react';
import styles from './ErrorModal.module.css';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.errorModalOverlay} onClick={onClose}>
      <div className={styles.errorModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.errorModalIcon}>
          <div className={styles.errorIconCircle}>
            <XCircle size={56} strokeWidth={2.5} />
          </div>
        </div>

        <h3 className={styles.errorModalTitle}>Oops! Something Went Wrong</h3>
        <p className={styles.errorModalText}>{message}</p>

        <button className={styles.errorOkButton} onClick={onClose}>
          Try Again
        </button>
      </div>
    </div>
  );
}