// apps/web/src/features/messages/types/messages.types.ts

/**
 * Messages Types
 * Aligned with Supabase schema: messages, conversations, conversation_participants
 */

export type ConversationFilter = 'all' | 'unread' | 'vip';

export type MessagesRole = 'staff' | 'manager' | 'admin';

export interface Message {
  id: string;
  conversation_id: string | null;
  sender_id: string | null;
  message_text: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  read_at?: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: string;
  appointment_id?: string | null;
  last_message_at?: string | null;
  created_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string | null;
  muted: boolean;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  vip_streak?: number;
  is_online?: boolean;
}

export interface MessageWithSender extends Message {
  sender?: {
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface ConversationWithDetails extends Conversation {
  other_user?: User;
  last_message_text?: string;
  unread_count: number;
}

export interface MessagesProps {
  role: MessagesRole;
}