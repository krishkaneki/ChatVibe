'use client';
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/providers/SocketProvider';
import { useChatStore } from '@/store/useChatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import DateSeparator from './DateSeparator';
import { Message } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  conversationId: string;
  currentUserId: string;
}

export default function MessageList({ conversationId, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocketContext();
  const { typingUsers } = useChatStore();
  const queryClient = useQueryClient();
  const typing = typingUsers[conversationId] || [];

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await axios.get(`/api/messages?conversationId=${conversationId}`);
      return res.data;
    },
  });

  // Mark conversation as read when user opens it — call the API once
  useEffect(() => {
    const markRead = async () => {
      try {
        await axios.post(`/api/conversations/${conversationId}/seen`);
        // Refresh conversation list so unread badge clears
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } catch { /* ignore */ }
    };
    markRead();
  }, [conversationId, queryClient]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', conversationId);
    socket.emit('mark-read', { conversationId, userId: currentUserId });

    // ── New message ──────────────────────────────────────────────────────────
    const handleNewMessage = (msg: Message & { conversationId?: string }) => {
      const msgConvId = msg.conversationId || msg.conversation;
      if (msgConvId !== conversationId) return;

      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => {
        if (old.some((m) => m._id === msg._id)) return old;
        return [...old, msg];
      });

      // Mark read immediately since user has this chat open
      socket.emit('mark-read', { conversationId, userId: currentUserId });
      axios.post(`/api/conversations/${conversationId}/seen`).then(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }).catch(() => {});
    };

    // ── Live delete ──────────────────────────────────────────────────────────
    const handleMessageDeleted = ({ conversationId: cId, messageId }: {
      conversationId: string; messageId: string;
    }) => {
      if (cId !== conversationId) return;
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: '' } : m
        )
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // ── Live reaction ────────────────────────────────────────────────────────
    const handleMessageReacted = ({ conversationId: cId, message }: {
      conversationId: string; message: Message;
    }) => {
      if (cId !== conversationId) return;
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((m) => m._id === message._id ? message : m)
      );
    };

    // ── Read receipt ─────────────────────────────────────────────────────────
    const handleMessageRead = ({ conversationId: cId }: { conversationId: string }) => {
      if (cId !== conversationId) return;
      // Optimistically mark all sent messages as read
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((m) =>
          m.sender._id === currentUserId && m.readBy.length === 0
            ? { ...m, readBy: [{ user: { _id: 'other' } as Message['readBy'][0]['user'], readAt: new Date() }] }
            : m
        )
      );
    };

    // ── Typing ───────────────────────────────────────────────────────────────
    const handleTypingStart = ({ conversationId: cId, userId, userName }: {
      conversationId: string; userId: string; userName: string;
    }) => {
      if (cId === conversationId) useChatStore.getState().setTyping(cId, userId, userName);
    };

    const handleTypingStop = ({ conversationId: cId, userId }: {
      conversationId: string; userId: string;
    }) => {
      if (cId === conversationId) useChatStore.getState().clearTyping(cId, userId);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('message-reacted', handleMessageReacted);
    socket.on('message-read', handleMessageRead);
    socket.on('user-typing', handleTypingStart);
    socket.on('user-stop-typing', handleTypingStop);

    return () => {
      socket.emit('leave-room', conversationId);
      socket.off('new-message', handleNewMessage);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('message-reacted', handleMessageReacted);
      socket.off('message-read', handleMessageRead);
      socket.off('user-typing', handleTypingStart);
      socket.off('user-stop-typing', handleTypingStop);
    };
  }, [socket, conversationId, currentUserId, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typing.length]);

  // Group by date
  const grouped: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const d = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.messages.push(msg);
    else grouped.push({ date: d, messages: [msg] });
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
            <div className={`space-y-1 ${i % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
              <div className="h-10 w-48 rounded-2xl skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 no-scrollbar">
      <AnimatePresence initial={false}>
        {grouped.map(({ date, messages: msgs }) => (
          <div key={date}>
            <DateSeparator date={date} />
            {msgs.map((msg, i) => {
              const isSent = msg.sender._id === currentUserId;
              const isGrouped = i > 0 && msgs[i - 1].sender._id === msg.sender._id;
              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isSent={isSent}
                  isGrouped={isGrouped}
                  currentUserId={currentUserId}
                  conversationId={conversationId}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>

      {typing.length > 0 && <TypingIndicator users={typing} />}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
