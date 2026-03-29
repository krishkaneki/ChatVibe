'use client';
import { useEffect } from 'react';
import { useSocketContext } from '@/providers/SocketProvider';
import { useChatStore } from '@/store/useChatStore';

export function useOnlineUsers() {
  const { socket } = useSocketContext();
  const { onlineUsers, setOnlineUsers, addOnlineUser, removeOnlineUser } = useChatStore();

  useEffect(() => {
    if (!socket) return;
    socket.on('online-users', setOnlineUsers);
    socket.on('user-connected', addOnlineUser);
    socket.on('user-disconnected', removeOnlineUser);
    return () => {
      socket.off('online-users');
      socket.off('user-connected');
      socket.off('user-disconnected');
    };
  }, [socket]);

  return { onlineUsers };
}
