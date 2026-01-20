// apps/web/src/features/messages/components/ConversationList.tsx

import { Search, Plus, MessageCircle } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { isVIP } from '../utils/messages.helpers';
import type { ConversationWithDetails, ConversationFilter } from '../types/messages.types';
import styles from '../Messages.module.css';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedConversation: string | null;
  searchQuery: string;
  activeFilter: ConversationFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: ConversationFilter) => void;
  onConversationSelect: (id: string) => void;
  onNewChatClick: () => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  searchQuery,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onConversationSelect,
  onNewChatClick,
}: ConversationListProps) {
  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.other_user?.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return conv.unread_count > 0;
    if (activeFilter === 'vip') return isVIP(conv.other_user);
    return true;
  });

  return (
    <>
      <div className={styles.sidebarHeader}>
        <div>
          <h2 className={styles.sidebarTitle}>Messages</h2>
          <p className={styles.sidebarSubtitle}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className={styles.newChatBtn} onClick={onNewChatClick}>
          <Plus size={20} />
        </button>
      </div>

      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search conversations..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.filterPills}>
        <button
          className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterPill} ${activeFilter === 'unread' ? styles.filterPillActive : ''}`}
          onClick={() => onFilterChange('unread')}
        >
          Unread
        </button>
        <button
          className={`${styles.filterPill} ${activeFilter === 'vip' ? styles.filterPillActive : ''}`}
          onClick={() => onFilterChange('vip')}
        >
          VIP
        </button>
      </div>

      <div className={styles.conversationsList}>
        {filteredConversations.length === 0 ? (
          <div className={styles.emptyConversations}>
            <MessageCircle size={48} />
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={selectedConversation === conv.id}
              onClick={() => onConversationSelect(conv.id)}
            />
          ))
        )}
      </div>
    </>
  );
}