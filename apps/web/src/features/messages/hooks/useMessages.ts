// apps/web/src/features/messages/hooks/useMessages.ts

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { messagesService } from '../services/messages.service';
import { usePresence } from './usePresence';
import { useTyping } from './useTyping';
import type {
  ConversationWithDetails,
  MessageWithSender,
  User,
  ConversationFilter,
} from '../types/messages.types';

/**
 * useMessages Hook
 * Main hook for managing messages state and logic
 */

export function useMessages() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  // Use presence hook for online status
  const { onlineUsers, setupPresence } = usePresence();

  // Use typing hook
  const { otherUserTyping, handleTyping, subscribeToTyping } = useTyping(
    selectedConversation,
    currentUserId
  );

  /**
   * Initialize messaging
   */
  useEffect(() => {
    initializeMessaging();

    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, []);

  /**
   * Subscribe to selected conversation
   */
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

  /**
   * Auto-scroll on messages change
   */
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, otherUserTyping]);

  /**
   * Force scroll when conversation changes
   */
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('instant'), 100);
    return () => clearTimeout(timer);
  }, [selectedConversation]);

  /**
   * Update conversations with online status
   */
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        other_user: conv.other_user
          ? {
              ...conv.other_user,
              is_online: onlineUsers.has(conv.other_user.id),
            }
          : undefined,
      }))
    );
  }, [onlineUsers]);

  async function initializeMessaging() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;

      setCurrentUserId(user.id);
      await Promise.all([
        fetchConversations(user.id),
        fetchAllUsers(user.id),
      ]);

      setupPresence(user.id);
    } catch (error) {
      console.error('❌ Error initializing:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConversations(userId: string) {
    const conversationsData = await messagesService.fetchConversations(userId, onlineUsers);
    setConversations(conversationsData);
  }

  async function fetchAllUsers(userId: string) {
    const usersData = await messagesService.fetchAllUsers(userId);
    setAllUsers(usersData);
  }

  async function fetchMessages(conversationId: string) {
    const messagesData = await messagesService.fetchMessages(conversationId);
    setMessages(messagesData);

    setTimeout(() => scrollToBottom('instant'), 50);

    await messagesService.markMessagesAsRead(conversationId, currentUserId);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv))
    );
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
          const newMsg = payload.new as any;
          const { data: senderData } = await supabase
            .from('users')
            .select('full_name, avatar_url, role')
            .eq('id', newMsg.sender_id)
            .single();

          setMessages((prev) => [...prev, { ...newMsg, sender: senderData || undefined }]);

          setTimeout(() => scrollToBottom('smooth'), 100);

          if (newMsg.sender_id !== currentUserId) {
            await messagesService.markMessagesAsRead(conversationId, currentUserId);
          }
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
          const updatedMsg = payload.new as any;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMsg.id ? { ...msg, read_at: updatedMsg.read_at } : msg
            )
          );
        }
      )
      .subscribe();
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messagesService.sendMessage(selectedConversation, currentUserId, newMessage);
      setNewMessage('');
      setTimeout(() => scrollToBottom('smooth'), 100);
      await fetchConversations(currentUserId);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  async function startNewConversation(otherUserId: string) {
    try {
      const conversationId = await messagesService.startNewConversation(
        currentUserId,
        otherUserId
      );

      if (conversationId) {
        setSelectedConversation(conversationId);
        setShowNewChat(false);
        setShowMobileChat(true);
        await fetchConversations(currentUserId);
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
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

  return {
    // State
    loading,
    conversations,
    selectedConversation,
    messages,
    newMessage,
    currentUserId,
    searchQuery,
    showNewChat,
    allUsers,
    showMobileChat,
    otherUserTyping,
    activeFilter,
    messagesEndRef,

    // Actions
    setNewMessage,
    setSearchQuery,
    setShowNewChat,
    setActiveFilter,
    sendMessage,
    startNewConversation,
    handleSelectConversation,
    handleBackToList,
    handleTyping,
  };
}