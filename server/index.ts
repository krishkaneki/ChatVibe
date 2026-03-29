import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer((req, res) => {
  const url = req.url || '';

  // Render (and similar hosts) may perform HTTP health checks.
  // Avoid interfering with Socket.IO's own HTTP handling at /socket.io.
  if (!url.startsWith('/socket.io')) {
    res.statusCode = 200;
    res.end('ok');
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: '*', // allow all origins for cross-device (phone ↔ laptop)
    methods: ['GET', 'POST'],
    credentials: false,
  },
});

const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // ── User presence ──────────────────────────────────────────────────────────
  socket.on('user-online', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    io.emit('user-connected', userId);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log(`✅ User ${userId} is online`);
  });

  // ── Room management ────────────────────────────────────────────────────────
  socket.on('join-room', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`📥 Socket ${socket.id} joined room: ${conversationId}`);
  });

  socket.on('leave-room', (conversationId: string) => {
    socket.leave(conversationId);
  });

  // ── New message ────────────────────────────────────────────────────────────
  socket.on('send-message', (message: any) => {
    const roomId = message.conversationId;
    if (!roomId) {
      console.warn('send-message missing conversationId');
      return;
    }
    socket.to(roomId).emit('new-message', message);
    console.log(`💬 Message → room ${roomId}`);
  });

  // ── Delete message — broadcast to room so others see it live ──────────────
  socket.on('delete-message', ({ conversationId, messageId }: any) => {
    if (!conversationId || !messageId) return;
    socket.to(conversationId).emit('message-deleted', { conversationId, messageId });
    console.log(`🗑️  Delete message ${messageId} → room ${conversationId}`);
  });

  // ── Reaction — broadcast updated message to room ───────────────────────────
  socket.on('react-message', ({ conversationId, message }: any) => {
    if (!conversationId || !message) return;
    socket.to(conversationId).emit('message-reacted', { conversationId, message });
    console.log(`😀 Reaction on ${message._id} → room ${conversationId}`);
  });

  // ── Typing indicators ──────────────────────────────────────────────────────
  socket.on('typing-start', ({ conversationId, userId, userName }: any) => {
    socket.to(conversationId).emit('user-typing', { conversationId, userId, userName });
  });

  socket.on('typing-stop', ({ conversationId, userId }: any) => {
    socket.to(conversationId).emit('user-stop-typing', { conversationId, userId });
  });

  // ── Read receipts ──────────────────────────────────────────────────────────
  socket.on('mark-read', ({ conversationId, userId }: any) => {
    socket.to(conversationId).emit('message-read', { conversationId, userId });
  });

  // ── Offline ────────────────────────────────────────────────────────────────
  socket.on('user-offline', (userId: string) => {
    onlineUsers.delete(userId);
    io.emit('user-disconnected', userId);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('user-disconnected', userId);
      io.emit('online-users', Array.from(onlineUsers.keys()));
      console.log(`❌ User ${userId} disconnected`);
    }
  });
});

// Render (and many PaaS hosts) require listening on process.env.PORT
const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.io server running on port ${PORT}`);
});
