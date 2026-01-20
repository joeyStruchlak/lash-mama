/**
 * DeleteConfirmModal Component
 * Confirmation dialog for note deletion
 */

'use client';

import { Trash2 } from 'lucide-react';
import type { DeleteConfirmModalProps } from '../types/notes.types';
import styles from '../Notes.module.css';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={styles.deleteModalIcon}>
          <div className={styles.deleteIconCircle}>
            <Trash2 size={48} />
          </div>
        </div>

        {/* Content */}
        <h3 className={styles.deleteModalTitle}>Delete Note?</h3>
        <p className={styles.deleteModalText}>
          Are you sure you want to delete this note? This action cannot be undone.
        </p>

        {/* Actions */}
        <div className={styles.deleteModalActions}>
          <button
            onClick={onClose}
            className={styles.deleteCancelButton}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.deleteConfirmButton}
          >
            Delete Note
          </button>
        </div>
      </div>
    </div>
  );
}