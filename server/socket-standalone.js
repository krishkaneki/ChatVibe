const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
  transports: ['websocket', 'polling'],
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    io.emit('user-connected', userId);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log('User online:', userId);
  });

  socket.on('join-room', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leave-room', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('send-message', (message) => {
    const roomId = message.conversationId;
    if (!roomId) return;
    socket.to(roomId).emit('new-message', message);
  });

  socket.on('delete-message', ({ conversationId, messageId }) => {
    if (!conversationId || !messageId) return;
    socket.to(conversationId).emit('message-deleted', { conversationId, messageId });
  });

  socket.on('react-message', ({ conversationId, message }) => {
    if (!conversationId || !message) return;
    socket.to(conversationId).emit('message-reacted', { conversationId, message });
  });

  socket.on('typing-start', ({ conversationId, userId, userName }) => {
    socket.to(conversationId).emit('user-typing', { conversationId, userId, userName });
  });

  socket.on('typing-stop', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user-stop-typing', { conversationId, userId });
  });

  socket.on('mark-read', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('message-read', { conversationId, userId });
  });

  socket.on('user-offline', (userId) => {
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
      console.log('User disconnected:', userId);
    }
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('Socket.io server running on port', PORT);
});