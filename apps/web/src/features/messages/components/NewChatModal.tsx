// apps/web/src/features/messages/components/NewChatModal.tsx

import { ArrowLeft, Crown } from 'lucide-react';
import { getInitials, getAvatarColor, isVIP } from '../utils/messages.helpers';
import type { User } from '../types/messages.types';
import styles from '../Messages.module.css';

interface NewChatModalProps {
  users: User[];
  onUserSelect: (userId: string) => void;
  onBackClick: () => void;
}

export function NewChatModal({ users, onUserSelect, onBackClick }: NewChatModalProps) {
  return (
    <div className={styles.newChatContainer}>
      <div className={styles.chatTopBar}>
        <button className={styles.backBtn} onClick={onBackClick}>
          <ArrowLeft size={24} />
        </button>
        <h3 className={styles.chatTopTitle}>New Conversation</h3>
      </div>
      <div className={styles.newChatList}>
        {users.map((user) => (
          <div
            key={user.id}
            className={styles.newChatUser}
            onClick={() => onUserSelect(user.id)}
          >
            <div
              className={styles.newChatAvatar}
              style={{ background: getAvatarColor(user.full_name) }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                <span>{getInitials(user.full_name)}</span>
              )}
            </div>
            <div>
              <div className={styles.newChatNameRow}>
                <p className={styles.newChatName}>{user.full_name}</p>
                {isVIP(user) && <Crown size={14} className={styles.vipIcon} />}
              </div>
              <p className={styles.newChatRole}>{user.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}