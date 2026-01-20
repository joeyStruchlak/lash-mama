// apps/web/src/features/messages/components/EmptyChat.tsx

import { MessageCircle } from 'lucide-react';
import styles from '../Messages.module.css';

export function EmptyChat() {
  return (
    <div className={styles.emptyChat}>
      <div className={styles.emptyChatIcon}>
        <MessageCircle size={64} />
      </div>
      <h3>Select a conversation</h3>
      <p>Choose from your existing chats or start a new one</p>
    </div>
  );
}