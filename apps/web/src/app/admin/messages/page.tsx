'use client';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Search, Plus, ArrowLeft, MessageCircle, Check, CheckCheck } from 'lucide-react';
import styles from './Messages.module.css';
import type { Message, Conversation, ConversationWithDetails, User, MessageWithSender } from '@/types/chat';

export default function AdminMessagesPage() {
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        initializeMessaging();
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation);
            subscribeToMessages(selectedConversation);
            subscribeToTyping(selectedConversation);
        }
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [selectedConversation]);

    useEffect(() => {
        // Always scroll when new messages arrive
        scrollToBottom();
    }, [messages.length]);


    // Auto-scroll when typing indicator appears
    useEffect(() => {
        if (otherUserTyping) {
            scrollToBottom();
        }
    }, [otherUserTyping]);

    async function initializeMessaging() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setCurrentUserId(user.id);
            await Promise.all([
                fetchConversations(user.id),
                fetchAllUsers(user.id)
            ]);
        } catch (err) {
            console.error('Error initializing:', err);
        } finally {
            setLoading(false);
        }
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

            const conversationIds = participantData.map(p => p.conversation_id);

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
                        .select('id, full_name, email, role, avatar_url')
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

                    return {
                        ...conv,
                        other_user: userData,
                        last_message_text: lastMessage?.message_text || 'Start chatting',
                        last_message_at: lastMessage?.created_at || conv.created_at,
                        unread_count: unreadCount || 0
                    };
                })
            );

            setConversations(enrichedConversations.filter(Boolean) as ConversationWithDetails[]);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        }
    }

    async function fetchAllUsers(currentUserId: string) {
        try {
            const { data } = await supabase
                .from('users')
                .select('id, full_name, email, role, avatar_url')
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

            // Instant scroll to bottom when messages load
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
                }
            }, 0);

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

            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
                )
            );
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }

    function subscribeToMessages(conversationId: string) {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        subscriptionRef.current = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    const newMsg = payload.new as Message;

                    const { data: senderData } = await supabase
                        .from('users')
                        .select('full_name, avatar_url, role')
                        .eq('id', newMsg.sender_id)
                        .single();

                    setMessages(prev => [...prev, { ...newMsg, sender: senderData || undefined }]);

                    if (newMsg.sender_id !== currentUserId) {
                        await markMessagesAsRead(conversationId);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    const updatedMsg = payload.new as Message;

                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === updatedMsg.id
                                ? { ...msg, read_at: updatedMsg.read_at }
                                : msg
                        )
                    );
                }
            )
            .subscribe();
    }

    function subscribeToTyping(conversationId: string) {
        const channel = supabase.channel(`room-${conversationId}`, {
            config: {
                broadcast: { self: false },
                presence: { key: currentUserId }
            }
        });

        channel
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                console.log('⌨️ Received typing event:', payload);
                if (payload.user_id !== currentUserId) {
                    setOtherUserTyping(true);
                    setTimeout(() => setOtherUserTyping(false), 3000);
                }
            })
            .subscribe((status) => {
                console.log('📡 Typing channel status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }

    async function handleTyping() {
        if (!selectedConversation || !currentUserId) return;

        try {
            const channel = supabase.channel(`room-${selectedConversation}`);

            await channel.subscribe();

            await channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: currentUserId, is_typing: true }
            });

            console.log('✅ Typing broadcast sent');

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                // Typing stopped
            }, 1000);
        } catch (err) {
            console.error('❌ Typing error:', err);
        }
    }

    async function sendMessage() {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: selectedConversation,
                    sender_id: currentUserId,
                    message_text: newMessage.trim()
                })
                .select();

            if (error) throw error;

            setNewMessage('');
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

            const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert({ type: 'direct' })
                .select()
                .single();

            if (convError) throw convError;

            const { error: participantError } = await supabase
                .from('conversation_participants')
                .insert([
                    { conversation_id: newConv.id, user_id: currentUserId },
                    { conversation_id: newConv.id, user_id: otherUserId }
                ]);

            if (participantError) throw participantError;

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

    function scrollToBottom() {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: 'instant',
                block: 'end',
                inline: 'nearest'
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
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function shouldShowDateSeparator(currentMsg: MessageWithSender, previousMsg: MessageWithSender | null): boolean {
        if (!previousMsg) return true;

        const currentDate = new Date(currentMsg.created_at).toDateString();
        const previousDate = new Date(previousMsg.created_at).toDateString();

        return currentDate !== previousDate;
    }

    function formatDateSeparator(dateStr: string): string {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    const filteredConversations = conversations.filter(conv =>
        conv.other_user?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedConvDetails = conversations.find(c => c.id === selectedConversation);

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
                        <h2 className={styles.sidebarTitle}>Messages</h2>
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

                    <div className={styles.conversationsList}>
                        {filteredConversations.length === 0 ? (
                            <div className={styles.emptyConversations}>
                                <MessageCircle size={48} />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv.id)}
                                    className={`${styles.convItem} ${selectedConversation === conv.id ? styles.convItemActive : ''}`}
                                >
                                    <div className={styles.convAvatar}>
                                        {conv.other_user?.avatar_url ? (
                                            <img src={conv.other_user.avatar_url} alt="" />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {getInitials(conv.other_user?.full_name || '')}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.convInfo}>
                                        <div className={styles.convTop}>
                                            <span className={styles.convName}>{conv.other_user?.full_name}</span>
                                            <span className={styles.convTime}>{formatTime(conv.last_message_at || conv.created_at)}</span>
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

                <main className={`${styles.chatMain} ${showMobileChat ? styles.chatMainVisibleMobile : ''}`}>
                    {showNewChat ? (
                        <div className={styles.newChatContainer}>
                            <div className={styles.chatTopBar}>
                                <button className={styles.backBtn} onClick={handleBackToList}>
                                    <ArrowLeft size={24} />
                                </button>
                                <h3 className={styles.chatTopTitle}>New Conversation</h3>
                            </div>
                            <div className={styles.newChatList}>
                                {allUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={styles.newChatUser}
                                        onClick={() => startNewConversation(user.id)}
                                    >
                                        <div className={styles.newChatAvatar}>
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" />
                                            ) : (
                                                <div className={styles.avatarPlaceholder}>
                                                    {getInitials(user.full_name)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className={styles.newChatName}>{user.full_name}</p>
                                            <p className={styles.newChatRole}>{user.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !selectedConversation ? (
                        <div className={styles.emptyChat}>
                            <div className={styles.emptyChatIcon}>
                                <Send size={56} />
                            </div>
                            <h3>Select a conversation</h3>
                            <p>Choose from the list to start messaging</p>
                        </div>
                    ) : (
                        <div className={styles.activeChat}>
                            <div className={styles.chatTopBar}>
                                <button className={styles.backBtn} onClick={handleBackToList}>
                                    <ArrowLeft size={24} />
                                </button>
                                <div className={styles.chatTopInfo}>
                                    <div className={styles.chatTopAvatar}>
                                        {selectedConvDetails?.other_user?.avatar_url ? (
                                            <img src={selectedConvDetails.other_user.avatar_url} alt="" />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {getInitials(selectedConvDetails?.other_user?.full_name || '')}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className={styles.chatTopName}>{selectedConvDetails?.other_user?.full_name}</p>
                                        {otherUserTyping ? (
                                            <p className={styles.typingText}>typing...</p>
                                        ) : (
                                            <p className={styles.chatTopRole}>{selectedConvDetails?.other_user?.role}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.messagesArea}>
                                {messages.map((msg, index) => {
                                    // 1. Calculate logic for date separators
                                    const previousMsg = index > 0 ? messages[index - 1] : null;
                                    const showDateSeparator = shouldShowDateSeparator(msg, previousMsg);

                                    return (
                                        // 2. Wrap everything in a Fragment so we can render two things (Date + Msg)
                                        <React.Fragment key={msg.id}>

                                            {/* 3. The Date Separator Header */}
                                            {showDateSeparator && (
                                                <div className={styles.dateSeparator}>
                                                    <span>{formatDateSeparator(msg.created_at)}</span>
                                                </div>
                                            )}

                                            {/* 4. Your Existing Message Row Logic */}
                                            <div
                                                className={`${styles.msgRow} ${msg.sender_id === currentUserId ? styles.msgRowSent : styles.msgRowReceived
                                                    }`}
                                            >
                                                {msg.sender_id !== currentUserId && (
                                                    <div className={styles.msgAvatar}>
                                                        {msg.sender?.avatar_url ? (
                                                            <img src={msg.sender.avatar_url} alt="" />
                                                        ) : (
                                                            <div className={styles.avatarPlaceholder}>
                                                                {getInitials(msg.sender?.full_name || 'U')}
                                                            </div>
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
                                                            {msg.sender_id === currentUserId && (
                                                                msg.read_at ? (
                                                                    <CheckCheck size={16} className={styles.tickRead} />
                                                                ) : (
                                                                    <CheckCheck size={16} className={styles.tickSent} />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}

                                {/* Typing indicator stays down here, unchanged */}
                                {otherUserTyping && (
                                    <div className={`${styles.msgRow} ${styles.msgRowReceived}`}>
                                        {/* ... typing logic ... */}
                                        <div className={styles.msgAvatar}>
                                            <div className={styles.avatarPlaceholder}>...</div>
                                        </div>
                                        <div className={styles.typingBubble}>
                                            <div className={styles.typingDots}>
                                                <span></span><span></span><span></span>
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