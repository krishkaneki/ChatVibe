export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  username?: string;
  isOnline: boolean;
  lastSeen?: Date;
  provider?: string;
  friends: string[];
  settings?: UserSettings;
  createdAt: Date;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
  notifications: boolean;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  fileUrl?: string;
  fileName?: string;
  reactions: Reaction[];
  readBy: ReadReceipt[];
  replyTo?: Message;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  emoji: string;
  user: User;
}

export interface ReadReceipt {
  user: User;
  readAt: Date;
}

export interface Conversation {
  _id: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  groupDescription?: string;
  groupAdmin?: User;
  lastMessage?: Message;
  lastMessageAt?: Date;
  createdAt: Date;
  unreadCount?: number;
}

export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface SocketMessage {
  conversationId: string;
  content: string;
  type: string;
  fileUrl?: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}
