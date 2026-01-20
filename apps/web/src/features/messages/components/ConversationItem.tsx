// apps/web/src/features/messages/components/ConversationItem.tsx

import { Crown } from 'lucide-react';
import { formatTime, getInitials, getAvatarColor, isVIP } from '../utils/messages.helpers';
import type { ConversationWithDetails } from '../types/messages.types';
import styles from '../Messages.module.css';

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  return (
    <div
      className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
      onClick={onClick}
    >
      <div className={styles.convAvatarWrapper}>
        <div
          className={styles.convAvatar}
          style={{ background: getAvatarColor(conversation.other_user?.full_name || '') }}
        >
          {conversation.other_user?.avatar_url ? (
            <img src={conversation.other_user.avatar_url} alt="" />
          ) : (
            <span>{getInitials(conversation.other_user?.full_name || '')}</span>
          )}
        </div>
        {conversation.other_user?.is_online && (
          <div
            className={styles.onlineDot}
            title={`${conversation.other_user.full_name} is online`}
          />
        )}
      </div>
      <div className={styles.convInfo}>
        <div className={styles.convTop}>
          <div className={styles.convNameRow}>
            <span className={styles.convName}>{conversation.other_user?.full_name}</span>
            {isVIP(conversation.other_user) && <Crown size={14} className={styles.vipIcon} />}
          </div>
          <span className={styles.convTime}>
            {formatTime(conversation.last_message_at || conversation.created_at)}
          </span>
        </div>
        <div className={styles.convBottom}>
          <span className={styles.convPreview}>{conversation.last_message_text}</span>
          {conversation.unread_count > 0 && (
            <span className={styles.unreadBadge}>{conversation.unread_count}</span>
          )}
        </div>
      </div>
    </div>
  );
}