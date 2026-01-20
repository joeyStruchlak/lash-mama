// apps/web/src/features/messages/Messages.tsx

'use client';

import { useMessages } from './hooks/useMessages';
import { ConversationList } from './components/ConversationList';
import { EmptyChat } from './components/EmptyChat';
import { NewChatModal } from './components/NewChatModal';
import { ActiveChat } from './components/ActiveChat';
import type { MessagesProps } from './types/messages.types';
import styles from './Messages.module.css';

/**
 * Messages Component
 * WhatsApp-style messaging interface - reusable across Staff/Admin/Manager roles
 */

export function Messages(_props: MessagesProps) {
  const {
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
    setNewMessage,
    setSearchQuery,
    setShowNewChat,
    setActiveFilter,
    sendMessage,
    startNewConversation,
    handleSelectConversation,
    handleBackToList,
    handleTyping,
  } = useMessages();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const selectedConvDetails = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.messagesWrapper}>
        {/* Left Sidebar */}
        <aside className={`${styles.sidebar} ${showMobileChat ? styles.sidebarHiddenMobile : ''}`}>
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onSearchChange={setSearchQuery}
            onFilterChange={setActiveFilter}
            onConversationSelect={handleSelectConversation}
            onNewChatClick={() => setShowNewChat(true)}
          />
        </aside>

        {/* Right Main Chat Area */}
        <main
          className={`${styles.chatMain} ${showMobileChat ? styles.chatMainVisibleMobile : ''}`}
        >
          {showNewChat ? (
            <NewChatModal
              users={allUsers}
              onUserSelect={startNewConversation}
              onBackClick={handleBackToList}
            />
          ) : !selectedConversation ? (
            <EmptyChat />
          ) : (
            <ActiveChat
              conversation={selectedConvDetails}
              messages={messages}
              currentUserId={currentUserId}
              newMessage={newMessage}
              isTyping={otherUserTyping}
              messagesEndRef={messagesEndRef}
              onBackClick={handleBackToList}
              onMessageChange={setNewMessage}
              onSendMessage={sendMessage}
              onTyping={handleTyping}
            />
          )}
        </main>
      </div>
    </div>
  );
}