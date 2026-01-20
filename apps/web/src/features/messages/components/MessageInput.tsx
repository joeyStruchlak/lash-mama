// apps/web/src/features/messages/components/MessageInput.tsx

import { Send } from 'lucide-react';
import styles from '../Messages.module.css';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
}

export function MessageInput({ value, onChange, onSend, onTyping }: MessageInputProps) {
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className={styles.inputBar}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onTyping();
        }}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className={styles.inputField}
      />
      <button onClick={onSend} disabled={!value.trim()} className={styles.sendBtn}>
        <Send size={18} />
      </button>
    </div>
  );
}