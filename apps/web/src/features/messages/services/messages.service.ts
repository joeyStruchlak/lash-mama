// apps/web/src/features/messages/services/messages.service.ts

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type {
  Message,
  ConversationWithDetails,
  MessageWithSender,
  User,
} from '../types/messages.types';

/**
 * Messages Service
 * Handles all Supabase queries for messaging
 */

export const messagesService = {
  /**
   * Fetch all conversations for current user
   */
  async fetchConversations(
    userId: string,
    onlineUsers: Set<string>
  ): Promise<ConversationWithDetails[]> {
    try {
      // Get user's conversation IDs
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (!participantData || participantData.length === 0) {
        return [];
      }

      const conversationIds = participantData.map((p) => p.conversation_id);

      // Get conversations
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (!conversationsData) return [];

      // Enrich with other user details
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

          const isUserOnline = onlineUsers.has(userData.id);

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

      return enrichedConversations.filter(Boolean) as ConversationWithDetails[];
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      return [];
    }
  },

  /**
   * Fetch all users (for new chat)
   */
  async fetchAllUsers(currentUserId: string): Promise<User[]> {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email, role, avatar_url, vip_streak')
        .neq('id', currentUserId);

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  },

  /**
   * Fetch messages for a conversation
   */
  async fetchMessages(conversationId: string): Promise<MessageWithSender[]> {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!data) return [];

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

      return messagesWithSenders;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, currentUserId: string): Promise<void> {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .is('read_at', null);
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  },

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    messageText: string
  ): Promise<void> {
    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: messageText.trim(),
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },

  /**
   * Start new conversation
   */
  async startNewConversation(
    currentUserId: string,
    otherUserId: string
  ): Promise<string | null> {
    try {
      // Check if conversation already exists
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
            return participant.conversation_id;
          }
        }
      }

      // Create new conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (!newConv) return null;

      // Add participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: newConv.id, user_id: currentUserId },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

      return newConv.id;
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      return null;
    }
  },
};