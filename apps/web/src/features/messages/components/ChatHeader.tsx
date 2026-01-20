// apps/web/src/features/messages/components/ChatHeader.tsx

import { ArrowLeft, Crown } from 'lucide-react';
import { getInitials, getAvatarColor, isVIP } from '../utils/messages.helpers';
import type { ConversationWithDetails } from '../types/messages.types';
import styles from '../Messages.module.css';

interface ChatHeaderProps {
  conversation: ConversationWithDetails | undefined;
  isTyping: boolean;
  onBackClick: () => void;
}

export function ChatHeader({ conversation, isTyping, onBackClick }: ChatHeaderProps) {
  if (!conversation) return null;

  return (
    <div className={styles.chatTopBar}>
      <button className={styles.backBtn} onClick={onBackClick}>
        <ArrowLeft size={24} />
      </button>
      <div className={styles.chatTopInfo}>
        <div className={styles.chatTopAvatarWrapper}>
          <div
            className={styles.chatTopAvatar}
            style={{
              background: getAvatarColor(conversation.other_user?.full_name || ''),
            }}
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
        <div>
          <div className={styles.chatTopNameRow}>
            <p className={styles.chatTopName}>{conversation.other_user?.full_name}</p>
            {isVIP(conversation.other_user) && <Crown size={14} className={styles.vipIcon} />}
          </div>
          {isTyping ? (
            <p className={styles.typingText}>typing...</p>
          ) : (
            <p className={styles.chatTopRole}>
              {conversation.other_user?.is_online
                ? 'Active now'
                : conversation.other_user?.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}