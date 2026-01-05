'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, User, Search, Paperclip } from 'lucide-react';
import type { ConversationWithDetails, Message } from '@/types/chat';

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        fetchConversations();
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            const unsubscribe = subscribeToMessages(selectedConversation.id);
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function getCurrentUser(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);
    }

    async function fetchConversations(): Promise<void> {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get conversations where user is a participant
            const { data: participantData, error: participantError } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user.id);

            if (participantError) throw participantError;

            const conversationIds = participantData.map(p => p.conversation_id);

            if (conversationIds.length === 0) {
                setConversations([]);
                return;
            }

            // Get conversation details
            const { data: conversationsData, error: conversationsError } = await supabase
                .from('conversations')
                .select('*')
                .in('id', conversationIds)
                .order('last_message_at', { ascending: false });

            if (conversationsError) throw conversationsError;

            // Get all participants for these conversations
            const { data: allParticipants, error: allParticipantsError } = await supabase
                .from('conversation_participants')
                .select('*, users(id, full_name, role, avatar_url)')
                .in('conversation_id', conversationIds);

            if (allParticipantsError) throw allParticipantsError;

            // Get unread counts
            const conversationsWithDetails = await Promise.all(
                (conversationsData || []).map(async (conv) => {
                    const participants = (allParticipants || [])
                        .filter((p: any) => p.conversation_id === conv.id)
                        .map((p: any) => ({
                            ...p,
                            user_name: p.users?.full_name,
                            user_role: p.users?.role,
                            user_avatar: p.users?.avatar_url,
                        }));

                    const otherParticipant = participants.find(p => p.user_id !== user.id);

                    // Count unread messages
                    const userParticipant = participants.find(p => p.user_id === user.id);
                    const lastReadAt = userParticipant?.last_read_at || '1970-01-01';

                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('conversation_id', conv.id)
                        .neq('sender_id', user.id)
                        .gt('created_at', lastReadAt);

                    return {
                        ...conv,
                        participants_details: participants,
                        unread_count: count || 0,
                        other_participant: otherParticipant,
                    };
                })
            );
    
            setConversations(conversationsWithDetails);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchMessages(conversationId: string): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:sender_id(full_name, role)
        `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const transformedMessages = (data || []).map((msg: any) => ({
                ...msg,
                sender_name: msg.sender?.full_name,
                sender_role: msg.sender?.role,
            }));

            setMessages(transformedMessages);

            // Mark messages as read
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('conversation_participants')
                    .update({ last_read_at: new Date().toISOString() })
                    .eq('conversation_id', conversationId)
                    .eq('user_id', user.id);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }

    function subscribeToMessages(conversationId: string): (() => void) | undefined {
        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (payload) => {
                    // Fetch sender details
                    const { data: senderData } = await supabase
                        .from('users')
                        .select('full_name, role')
                        .eq('id', payload.new.sender_id)
                        .single();

                    const newMessage = {
                        ...payload.new,
                        sender_name: senderData?.full_name,
                        sender_role: senderData?.role,
                    } as Message;

                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    async function handleSendMessage(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

        try {
            setSending(true);

            const { error } = await supabase.from('messages').insert({
                conversation_id: selectedConversation.id,
                sender_id: currentUserId,
                message_text: newMessage.trim(),
            });

            if (error) throw error;

            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    }

    function scrollToBottom(): void {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    function formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-AU', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
            });
        }
    }

    const filteredConversations = conversations.filter((conv) =>
        conv.other_participant?.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-[#2A2A2A]">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7]">
            <div className="flex h-screen">
                {/* Conversations List */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <h1
                            className="text-2xl font-bold text-[#2A2A2A] mb-4"
                            style={{ fontFamily: 'Cormorant Garamond, serif' }}
                        >
                            Messages
                        </h1>
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-[#3D3D3D]">No conversations yet</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${selectedConversation?.id === conv.id
                                        ? 'bg-[#F5F2EF]'
                                        : 'hover:bg-[#FAFAF7]'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#C9A871] text-white flex items-center justify-center font-bold flex-shrink-0">
                                            {conv.other_participant?.user_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-semibold text-[#2A2A2A] truncate">
                                                    {conv.other_participant?.user_name || 'Unknown'}
                                                </p>
                                                {conv.last_message_at && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(conv.last_message_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-[#3D3D3D] truncate">
                                                    {conv.type === 'direct' ? 'Direct message' : 'Group chat'}
                                                </p>
                                                {conv.unread_count > 0 && (
                                                    <span className="bg-[#C9A871] text-white text-xs px-2 py-1 rounded-full font-medium">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#FAFAF7]">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#C9A871] text-white flex items-center justify-center font-bold">
                                        {selectedConversation.other_participant?.user_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#2A2A2A]">
                                            {selectedConversation.other_participant?.user_name || 'Unknown'}
                                        </p>
                                        <p className="text-sm text-[#3D3D3D] capitalize">
                                            {selectedConversation.other_participant?.user_role || 'User'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message) => {
                                    const isOwn = message.sender_id === currentUserId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-md px-4 py-3 rounded-2xl ${isOwn
                                                    ? 'bg-[#C9A871] text-white'
                                                    : 'bg-white text-[#2A2A2A]'
                                                    }`}
                                            >
                                                {!isOwn && (
                                                    <p className="text-xs font-medium mb-1 opacity-70">
                                                        {message.sender_name}
                                                    </p>
                                                )}
                                                <p className="text-sm">{message.message_text}</p>
                                                <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                                    {formatTime(message.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="bg-white border-t border-gray-200 p-4">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Send size={20} />
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-xl text-[#3D3D3D]">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}