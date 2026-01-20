// apps/web/src/types/chat.ts

// Base interfaces matching public.messages schema
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

export interface MessageWithSender extends Message {
  sender?: {
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  vip_streak?: number;
}

export interface ConversationWithDetails extends Conversation {
  other_user?: User & {
    is_online?: boolean;
    last_seen?: string;
  };
  last_message_text?: string;
  unread_count: number;
}

export type ConversationFilter = 'all' | 'unread' | 'vip';
