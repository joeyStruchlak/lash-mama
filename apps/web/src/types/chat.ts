export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string; // Joined from users
  sender_role?: string; // Joined from users
  message_text: string;
  attachment_url?: string | null;
  attachment_type?: 'image' | 'file' | null;
  read_at?: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[]; // Array of user IDs
  appointment_id?: string | null;
  last_message_at?: string | null;
  last_message_text?: string | null;
  created_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  user_name?: string; // Joined from users
  user_role?: string; // Joined from users
  user_avatar?: string | null; // Joined from users
  joined_at: string;
  last_read_at?: string | null;
  muted: boolean;
}

export interface ConversationWithDetails extends Conversation {
  participants_details: ConversationParticipant[];
  unread_count: number;
  other_participant?: ConversationParticipant; // For direct chats
}