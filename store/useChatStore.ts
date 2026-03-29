import { create } from 'zustand';
import { Message, Conversation } from '@/types';

interface ChatStore {
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  typingUsers: Record<string, { userId: string; userName: string }[]>;
  setTyping: (conversationId: string, userId: string, userName: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversation: null,
  setActiveConversation: (id) => set({ activeConversation: id }),
  typingUsers: {},
  setTyping: (conversationId, userId, userName) =>
    set((state) => {
      const existing = state.typingUsers[conversationId] || [];
      const filtered = existing.filter((u) => u.userId !== userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...filtered, { userId, userName }],
        },
      };
    }),
  clearTyping: (conversationId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] || []).filter(
          (u) => u.userId !== userId
        ),
      },
    })),
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),
  removeOnlineUser: (userId) =>
    set((state) => ({ onlineUsers: state.onlineUsers.filter((id) => id !== userId) })),
}));
