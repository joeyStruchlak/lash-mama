'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Search } from 'lucide-react';
import styles from './StaffMessages.module.css';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: {
    full_name: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    role: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function StaffMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      // Placeholder - real implementation would fetch actual conversations
      setConversations([]);

    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.messagesContainer}>
      {/* Conversations Sidebar */}
      <div className={styles.conversationsSidebar}>
        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search messages..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className={styles.conversationList}>
          {conversations.length === 0 ? (
            <div className={styles.conversationsEmpty}>
              <p className={styles.conversationsEmptyText}>
                No messages yet
              </p>
              <p className={styles.conversationsEmptySubtext}>
                Your conversations will appear here
              </p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`${styles.conversationItem} ${
                  selectedConversation === conv.id ? styles.conversationItemActive : ''
                }`}
              >
                <div className={styles.conversationHeader}>
                  <p className={styles.conversationName}>
                    {conv.other_user.full_name}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className={styles.unreadBadge}>
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className={styles.conversationLastMessage}>
                  {conv.last_message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {!selectedConversation ? (
          <div className={styles.messagesEmpty}>
            <div className={styles.emptyIconWrapper}>
              <Send size={36} color="#B8956A" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className={styles.emptyTitle}>
                No conversation selected
              </p>
              <p className={styles.emptySubtitle}>
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className={styles.messagesList}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${
                    msg.sender_id === currentUserId ? styles.messageWrapperSent : styles.messageWrapperReceived
                  }`}
                >
                  <div className={`${styles.messageBubble} ${
                    msg.sender_id === currentUserId ? styles.messageBubbleSent : styles.messageBubbleReceived
                  }`}>
                    <p className={styles.messageText}>
                      {msg.content}
                    </p>
                  </div>
                  <p className={`${styles.messageTime} ${
                    msg.sender_id === currentUserId ? styles.messageTimeSent : styles.messageTimeReceived
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className={styles.messageInput}>
              <div className={styles.messageInputForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className={styles.messageTextField}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={styles.sendButton}
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}