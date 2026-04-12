'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const isIpHost = (host: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);

const resolveSocketUrl = (): string | null => {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  // SSR / build-time fallback
  if (typeof window === 'undefined') {
    return envUrl || 'http://localhost:3001';
  }

  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const isSiteLocal = host === 'localhost' || host === '127.0.0.1';

  // If not provided, default to same host as the site (common for mobile testing on LAN)
  if (!envUrl) {
    // Only assume :3001 exists when we're on localhost or accessing via a LAN IP.
    // On hosted domains (e.g. Vercel), this would point to a non-existent socket server
    // and can cause repeated reconnect/polling that hurts mobile UX.
    if (isSiteLocal || isIpHost(host)) {
      return `${protocol}//${host}:3001`;
    }
    return null;
  }

  // If env URL points to localhost but the site is being accessed via a LAN IP or domain,
  // rewrite to the current hostname so mobile devices don't try to connect to their own localhost.
  try {
    const parsed = new URL(envUrl);
    const envHost = parsed.hostname;
    const envPort = parsed.port || '3001';
    const isEnvLocal = envHost === 'localhost' || envHost === '127.0.0.1';
    if (isEnvLocal && !isSiteLocal) {
      return `${protocol}//${host}:${envPort}`;
    }
  } catch {
    // ignore malformed envUrl and use as-is
  }

  return envUrl;
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    const url = resolveSocketUrl();
    if (!url) return null;
    socket = io(url, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 12000,
      transports: ['websocket', 'polling'], // fallback to polling for cross-device
    });
  }
  return socket;
};

export const connectSocket = (userId: string): Socket | null => {
  const s = getSocket();
  if (!s) return null;

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
