// apps/web/src/features/messages/components/ActiveChat.tsx

import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { ConversationWithDetails, MessageWithSender } from '../types/messages.types';
import styles from '../Messages.module.css';

interface ActiveChatProps {
  conversation: ConversationWithDetails | undefined;
  messages: MessageWithSender[];
  currentUserId: string;
  newMessage: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onBackClick: () => void;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onTyping: () => void;
}

export function ActiveChat({
  conversation,
  messages,
  currentUserId,
  newMessage,
  isTyping,
  messagesEndRef,
  onBackClick,
  onMessageChange,
  onSendMessage,
  onTyping,
}: ActiveChatProps) {
  return (
    <div className={styles.activeChat}>
      <ChatHeader
        conversation={conversation}
        isTyping={isTyping}
        onBackClick={onBackClick}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      <MessageInput
        value={newMessage}
        onChange={onMessageChange}
        onSend={onSendMessage}
        onTyping={onTyping}
      />
    </div>
  );
}