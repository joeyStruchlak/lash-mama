// apps/web/src/features/messages/components/TypingIndicator.tsx

import styles from '../Messages.module.css';

export function TypingIndicator() {
  return (
    <div className={`${styles.msgRow} ${styles.msgRowReceived}`}>
      <div className={styles.msgAvatar}>
        <div className={styles.avatarPlaceholder}>...</div>
      </div>
      <div className={styles.typingBubble}>
        <div className={styles.typingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}