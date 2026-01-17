// apps/web/src/features/hours/components/DeleteConfirmModal.tsx

import { XCircle } from 'lucide-react';
import styles from '../Hours.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.deleteModalIcon}>
          <div className={styles.deleteIconCircle}>
            <XCircle size={48} strokeWidth={2} />
          </div>
        </div>

        <h3 className={styles.deleteModalTitle}>Delete Time Off Request?</h3>
        <p className={styles.deleteModalText}>
          Are you sure you want to delete this time off request? This action cannot be undone.
        </p>

        <div className={styles.deleteModalActions}>
          <button className={styles.cancelDeleteButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmDeleteButton} onClick={onConfirm}>
            Delete Request
          </button>
        </div>
      </div>
    </div>
  );
}