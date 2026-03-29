'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'], // fallback to polling for cross-device
    });
  }
  return socket;
};

export const connectSocket = (userId: string): Socket => {
  const s = getSocket();

  // On connect / reconnect, always re-register the user as online
  s.off('connect'); // prevent duplicate handlers
  s.on('connect', () => {
    s.emit('user-online', userId);
    console.log('Socket connected, userId registered:', userId);
  });

  if (!s.connected) {
    s.connect();
  } else {
    // Already connected — re-emit user-online in case server restarted
    s.emit('user-online', userId);
  }

  return s;
};

export const disconnectSocket = (userId: string) => {
  if (socket?.connected) {
    socket.emit('user-offline', userId);
    socket.disconnect();
  }
  socket = null; // reset so next connectSocket creates a fresh instance
};
