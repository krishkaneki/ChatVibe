'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useSocketContext } from '@/providers/SocketProvider';
import { useChatStore } from '@/store/useChatStore';

export function useTyping(conversationId: string, currentUserId: string, userName: string) {
  const { socket } = useSocketContext();
  const typingTimeout = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      socket?.emit('typing-start', { conversationId, userId: currentUserId, userName });
      isTypingRef.current = true;
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing-stop', { conversationId, userId: currentUserId });
      isTypingRef.current = false;
    }, 2000);
  }, [socket, conversationId, currentUserId, userName]);

  useEffect(() => () => clearTimeout(typingTimeout.current), []);

  return { startTyping };
}
