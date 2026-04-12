'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const resolveSocketUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  // SSR / build-time fallback
  if (typeof window === 'undefined') {
    return envUrl || 'http://localhost:3001';
  }

  const host = window.location.hostname;
  const protocol = window.location.protocol;

  // If not provided, default to same host as the site (common for mobile testing on LAN)
  if (!envUrl) {
    return `${protocol}//${host}:3001`;
  }

  // If env URL points to localhost but the site is being accessed via a LAN IP or domain,
  // rewrite to the current hostname so mobile devices don't try to connect to their own localhost.
  try {
    const parsed = new URL(envUrl);
    const envHost = parsed.hostname;
    const envPort = parsed.port || '3001';
    const isEnvLocal = envHost === 'localhost' || envHost === '127.0.0.1';
    const isSiteLocal = host === 'localhost' || host === '127.0.0.1';
    if (isEnvLocal && !isSiteLocal) {
      return `${protocol}//${host}:${envPort}`;
    }
  } catch {
    // ignore malformed envUrl and use as-is
  }

  return envUrl;
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
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
