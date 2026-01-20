/**
 * SuccessModal Component
 * Success feedback with confetti animation
 */

'use client';

import { StickyNote } from 'lucide-react';
import type { SuccessModalProps } from '../types/notes.types';
import styles from '../Notes.module.css';

export function SuccessModal({ isOpen, title, message, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.successModalContent} onClick={(e) => e.stopPropagation()}>
        {/* Confetti Animation */}
        <div className={styles.successConfetti}>
          <div className={styles.confettiPiece}></div>
          <div className={styles.confettiPiece}></div>
          <div className={styles.confettiPiece}></div>
          <div className={styles.confettiPiece}></div>
          <div className={styles.confettiPiece}></div>
          <div className={styles.confettiPiece}></div>
        </div>

        {/* Icon */}
        <div className={styles.successModalIcon}>
          <div className={styles.successIconCircle}>
            <StickyNote size={56} />
          </div>
        </div>

        {/* Content */}
        <h3 className={styles.successModalTitle}>{title}</h3>
        <p className={styles.successModalText}>{message}</p>

        {/* Action */}
        <button
          onClick={onClose}
          className={styles.successOkButton}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}