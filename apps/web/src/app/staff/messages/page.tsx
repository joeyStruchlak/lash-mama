'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Send,
  Search,
  Plus,
  ArrowLeft,
  MessageCircle,
  Check,
  CheckCheck,
  Crown,
} from 'lucide-react';
import styles from './Messages.module.css';
import type {
  Message,
  Conversation,
  ConversationWithDetails,
  User,
  MessageWithSender,
  ConversationFilter,
} from '@/types/chat';

export default function StaffMessagesPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    initializeMessaging();
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
      subscribeToTyping(selectedConversation);
    }
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, [selectedConversation]);

  // Enhanced auto-scroll - scroll on ANY change to messages or typing
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, otherUserTyping]);

  // Force scroll when messages area mounts/updates
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('instant'), 100);
    return () => clearTimeout(timer);
  }, [selectedConversation]);

  async function initializeMessaging() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);
      await Promise.all([fetchConversations(user.id), fetchAllUsers(user.id)]);

      // Setup presence tracking
      setupPresence(user.id);
    } catch (err) {
      console.error('Error initializing:', err);
    } finally {
      setLoading(false);
    }
  }

  function setupPresence(userId: string) {
    console.log('🟢 Setting up presence for user:', userId);

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('👥 Presence sync - Current state:', state);
        const online = new Set(Object.keys(state));
        console.log('🟢 Online users:', Array.from(online));
        setOnlineUsers(online);

        // Update conversations with online status
        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            other_user: conv.other_user
              ? {
                  ...conv.other_user,
                  is_online: online.has(conv.other_user.id),
                }
              : undefined,
          }))
        );
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('✅ User joined:', key, newPresences);
        setOnlineUsers((prev) => {
          const updated = new Set([...prev, key]);
          console.log('🟢 Updated online users:', Array.from(updated));
          return updated;
        });

        // Update conversations
        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            other_user: conv.other_user
              ? {
                  ...conv.other_user,
                  is_online: conv.other_user.id === key ? true : conv.other_user.is_online,
                }
              : undefined,
          }))
        );
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('❌ User left:', key, leftPresences);
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(key);
          console.log('🔴 Updated online users:', Array.from(updated));
          return updated;
        });

        // Update conversations
        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            other_user: conv.other_user
              ? {
                  ...conv.other_user,
                  is_online: conv.other_user.id === key ? false : conv.other_user.is_online,
                }
              : undefined,
          }))
        );
      })
      .subscribe(async (status) => {
        console.log('📡 Presence channel status:', status);

        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
          console.log('✅ Presence tracked:', presenceTrackStatus);
        }

        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Presence channel error');
        }
      });

    presenceChannelRef.current = channel;
  }

  async function fetchConversations(userId: string) {
    try {
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participantData.map((p) => p.conversation_id);

      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (!conversationsData) return;

      const enrichedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
            .neq('user_id', userId);

          if (!participants || participants.length === 0) return null;

          const { data: userData } = await supabase
            .from('users')
            .select('id, full_name, email, role, avatar_url, vip_streak')
            .eq('id', participants[0].user_id)
            .single();

          if (!userData) return null;

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('message_text, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

          // Check if this user is online
          const isUserOnline = onlineUsers.has(userData.id);
          console.log(`👤 User ${userData.full_name} online status:`, isUserOnline);

          return {
            ...conv,
            other_user: {
              ...userData,
              is_online: isUserOnline,
            },
            last_message_text: lastMessage?.message_text || 'Start chatting',
            last_message_at: lastMessage?.created_at || conv.created_at,
            unread_count: unreadCount || 0,
          };
        })
      );

      const filtered = enrichedConversations.filter(Boolean) as ConversationWithDetails[];
      console.log('💬 Loaded conversations:', filtered.length);
      console.log('🟢 Online users count:', onlineUsers.size);
      setConversations(filtered);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }

  async function fetchAllUsers(currentUserId: string) {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email, role, avatar_url, vip_streak')
        .neq('id', currentUserId);

      if (data) setAllUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  async function fetchMessages(conversationId: string) {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!data) return;

      const messagesWithSenders = await Promise.all(
        data.map(async (msg) => {
          const { data: senderData } = await supabase
            .from('users')
            .select('full_name, avatar_url, role')
            .eq('id', msg.sender_id)
            .single();

          return { ...msg, sender: senderData || undefined };
        })
      );

      setMessages(messagesWithSenders);

      // Instant scroll when messages first load
      setTimeout(() => scrollToBottom('instant'), 50);

      markMessagesAsRead(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }

  async function markMessagesAsRead(conversationId: string) {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .is('read_at', null);

      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv))
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }

  function subscribeToMessages(conversationId: string) {
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

    subscriptionRef.current = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: senderData } = await supabase
            .from('users')
            .select('full_name, avatar_url, role')
            .eq('id', newMsg.sender_id)
            .single();

          setMessages((prev) => [...prev, { ...newMsg, sender: senderData || undefined }]);

          // Auto-scroll when new message arrives
          setTimeout(() => scrollToBottom('smooth'), 100);

          if (newMsg.sender_id !== currentUserId) await markMessagesAsRead(conversationId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMsg.id ? { ...msg, read_at: updatedMsg.read_at } : msg
            )
          );
        }
      )
      .subscribe();
  }

  function subscribeToTyping(conversationId: string) {
    const channel = supabase.channel(`room-${conversationId}`, {
      config: { broadcast: { self: false }, presence: { key: currentUserId } },
    });

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async function handleTyping() {
    if (!selectedConversation || !currentUserId) return;
    const channel = supabase.channel(`room-${selectedConversation}`);
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUserId, is_typing: true },
    });
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: currentUserId,
        message_text: newMessage.trim(),
      });

      setNewMessage('');

      // Smooth scroll after sending
      setTimeout(() => scrollToBottom('smooth'), 100);

      await fetchConversations(currentUserId);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  async function startNewConversation(otherUserId: string) {
    try {
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId)
            .single();

          if (otherParticipant) {
            setSelectedConversation(participant.conversation_id);
            setShowNewChat(false);
            setShowMobileChat(true);
            return;
          }
        }
      }

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (!newConv) return;

      await supabase.from('conversation_participants').insert([
        { conversation_id: newConv.id, user_id: currentUserId },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

      setSelectedConversation(newConv.id);
      setShowNewChat(false);
      setShowMobileChat(true);
      await fetchConversations(currentUserId);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  }

  function handleSelectConversation(convId: string) {
    setSelectedConversation(convId);
    setShowMobileChat(true);
  }

  function handleBackToList() {
    setShowMobileChat(false);
    setShowNewChat(false);
  }

  function scrollToBottom(behavior: 'smooth' | 'instant' = 'smooth') {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: behavior,
        block: 'end',
        inline: 'nearest',
      });
    }
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, hsl(340 82% 85%) 0%, hsl(340 82% 75%) 100%)',
      'linear-gradient(135deg, hsl(217 91% 85%) 0%, hsl(217 91% 75%) 100%)',
      'linear-gradient(135deg, hsl(142 76% 85%) 0%, hsl(142 76% 75%) 100%)',
      'linear-gradient(135deg, hsl(37 91% 85%) 0%, hsl(37 91% 75%) 100%)',
      'linear-gradient(135deg, hsl(271 76% 85%) 0%, hsl(271 76% 75%) 100%)',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  function isVIP(user?: User): boolean {
    return (user?.vip_streak ?? 0) >= 10 || user?.role === 'vip';
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.other_user?.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return conv.unread_count > 0;
    if (activeFilter === 'vip') return isVIP(conv.other_user);
    return true;
  });

  const selectedConvDetails = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.messagesWrapper}>
        <aside className={`${styles.sidebar} ${showMobileChat ? styles.sidebarHiddenMobile : ''}`}>
          <div className={styles.sidebarHeader}>
            <div>
              <h2 className={styles.sidebarTitle}>Messages</h2>
              <p className={styles.sidebarSubtitle}>
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button className={styles.newChatBtn} onClick={() => setShowNewChat(true)}>
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterPills}>
            <button
              className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterPill} ${activeFilter === 'unread' ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
            </button>
            <button
              className={`${styles.filterPill} ${activeFilter === 'vip' ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter('vip')}
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
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`${styles.convItem} ${selectedConversation === conv.id ? styles.convItemActive : ''}`}
                >
                  <div className={styles.convAvatarWrapper}>
                    <div
                      className={styles.convAvatar}
                      style={{ background: getAvatarColor(conv.other_user?.full_name || '') }}
                    >
                      {conv.other_user?.avatar_url ? (
                        <img src={conv.other_user.avatar_url} alt="" />
                      ) : (
                        <span>{getInitials(conv.other_user?.full_name || '')}</span>
                      )}
                    </div>
                    {conv.other_user?.is_online && (
                      <div
                        className={styles.onlineDot}
                        title={`${conv.other_user.full_name} is online`}
                      />
                    )}
                  </div>
                  <div className={styles.convInfo}>
                    <div className={styles.convTop}>
                      <div className={styles.convNameRow}>
                        <span className={styles.convName}>{conv.other_user?.full_name}</span>
                        {isVIP(conv.other_user) && <Crown size={14} className={styles.vipIcon} />}
                      </div>
                      <span className={styles.convTime}>
                        {formatTime(conv.last_message_at || conv.created_at)}
                      </span>
                    </div>
                    <div className={styles.convBottom}>
                      <span className={styles.convPreview}>{conv.last_message_text}</span>
                      {conv.unread_count > 0 && (
                        <span className={styles.unreadBadge}>{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main
          className={`${styles.chatMain} ${showMobileChat ? styles.chatMainVisibleMobile : ''}`}
        >
          {showNewChat ? (
            <div className={styles.newChatContainer}>
              <div className={styles.chatTopBar}>
                <button className={styles.backBtn} onClick={handleBackToList}>
                  <ArrowLeft size={24} />
                </button>
                <h3 className={styles.chatTopTitle}>New Conversation</h3>
              </div>
              <div className={styles.newChatList}>
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className={styles.newChatUser}
                    onClick={() => startNewConversation(user.id)}
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
          ) : !selectedConversation ? (
            <div className={styles.emptyChat}>
              <div className={styles.emptyChatIcon}>
                <MessageCircle size={64} />
              </div>
              <h3>Select a conversation</h3>
              <p>Choose from your existing chats or start a new one</p>
            </div>
          ) : (
            <div className={styles.activeChat}>
              <div className={styles.chatTopBar}>
                <button className={styles.backBtn} onClick={handleBackToList}>
                  <ArrowLeft size={24} />
                </button>
                <div className={styles.chatTopInfo}>
                  <div className={styles.chatTopAvatarWrapper}>
                    <div
                      className={styles.chatTopAvatar}
                      style={{
                        background: getAvatarColor(
                          selectedConvDetails?.other_user?.full_name || ''
                        ),
                      }}
                    >
                      {selectedConvDetails?.other_user?.avatar_url ? (
                        <img src={selectedConvDetails.other_user.avatar_url} alt="" />
                      ) : (
                        <span>{getInitials(selectedConvDetails?.other_user?.full_name || '')}</span>
                      )}
                    </div>
                    {selectedConvDetails?.other_user?.is_online && (
                      <div
                        className={styles.onlineDot}
                        title={`${selectedConvDetails.other_user.full_name} is online`}
                      />
                    )}
                  </div>
                  <div>
                    <div className={styles.chatTopNameRow}>
                      <p className={styles.chatTopName}>
                        {selectedConvDetails?.other_user?.full_name}
                      </p>
                      {isVIP(selectedConvDetails?.other_user) && (
                        <Crown size={14} className={styles.vipIcon} />
                      )}
                    </div>
                    {otherUserTyping ? (
                      <p className={styles.typingText}>typing...</p>
                    ) : (
                      <p className={styles.chatTopRole}>
                        {selectedConvDetails?.other_user?.is_online
                          ? 'Active now'
                          : selectedConvDetails?.other_user?.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.msgRow} ${
                      msg.sender_id === currentUserId ? styles.msgRowSent : styles.msgRowReceived
                    }`}
                  >
                    {msg.sender_id !== currentUserId && (
                      <div
                        className={styles.msgAvatar}
                        style={{ background: getAvatarColor(msg.sender?.full_name || '') }}
                      >
                        {msg.sender?.avatar_url ? (
                          <img src={msg.sender.avatar_url} alt="" />
                        ) : (
                          <span>{getInitials(msg.sender?.full_name || 'U')}</span>
                        )}
                      </div>
                    )}
                    <div className={styles.msgContent}>
                      <div className={styles.msgBubble}>
                        <p className={styles.msgText}>{msg.message_text}</p>
                        <div className={styles.msgMetaInline}>
                          <span className={styles.msgTime}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          {msg.sender_id === currentUserId &&
                            (msg.read_at ? (
                              <CheckCheck size={16} className={styles.tickRead} />
                            ) : (
                              <CheckCheck size={16} className={styles.tickSent} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {otherUserTyping && (
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
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputBar}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className={styles.inputField}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={styles.sendBtn}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
