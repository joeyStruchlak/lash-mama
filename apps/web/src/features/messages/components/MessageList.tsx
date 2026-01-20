// apps/web/src/features/messages/components/MessageList.tsx

import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { MessageWithSender } from '../types/messages.types';
import styles from '../Messages.module.css';

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  currentUserId,
  isTyping,
  messagesEndRef,
}: MessageListProps) {
  return (
    <div className={styles.messagesArea}>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.sender_id === currentUserId}
        />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}