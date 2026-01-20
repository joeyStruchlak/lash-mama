// apps/web/src/features/messages/components/MessageBubble.tsx

import { CheckCheck } from 'lucide-react';
import { formatMessageTime, getInitials, getAvatarColor } from '../utils/messages.helpers';
import type { MessageWithSender } from '../types/messages.types';
import styles from '../Messages.module.css';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`${styles.msgRow} ${isOwn ? styles.msgRowSent : styles.msgRowReceived}`}>
      {!isOwn && (
        <div
          className={styles.msgAvatar}
          style={{ background: getAvatarColor(message.sender?.full_name || '') }}
        >
          {message.sender?.avatar_url ? (
            <img src={message.sender.avatar_url} alt="" />
          ) : (
            <span>{getInitials(message.sender?.full_name || 'U')}</span>
          )}
        </div>
      )}
      <div className={styles.msgContent}>
        <div className={styles.msgBubble}>
          <p className={styles.msgText}>{message.message_text}</p>
          <div className={styles.msgMetaInline}>
            <span className={styles.msgTime}>{formatMessageTime(message.created_at)}</span>
            {isOwn &&
              (message.read_at ? (
                <CheckCheck size={16} className={styles.tickRead} />
              ) : (
                <CheckCheck size={16} className={styles.tickSent} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}