'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/providers/SocketProvider';
import ConversationItem from './ConversationItem';
import { Conversation } from '@/types';
import { Search } from 'lucide-react';

interface Props { userId: string; }

type TabType = 'all' | 'groups' | 'unread';

export default function ConversationList({ userId }: Props) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await axios.get('/api/conversations');
      return res.data;
    },
    enabled: !!userId,
    refetchInterval: 30000, // poll every 30s as fallback
  });

  // Listen for new messages to refresh conversation list (with unread counts)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('conversation-updated', handleNewMessage);
    socket.on('message-read', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('conversation-updated', handleNewMessage);
      socket.off('message-read', handleNewMessage);
    };
  }, [socket, queryClient]);

  // Total unread count for any notification purposes
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  // Apply tab filter
  const tabFiltered = conversations.filter((c) => {
    if (activeTab === 'groups') return c.isGroup;
    if (activeTab === 'unread') return (c.unreadCount ?? 0) > 0;
    return true; // 'all'
  });

  // Apply search filter
  const filtered = tabFiltered.filter((c) => {
    const name = c.isGroup
      ? c.groupName || ''
      : c.participants.find((p) => p._id !== userId)?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All Chats' },
    { key: 'groups', label: 'Groups' },
    { key: 'unread', label: 'Unread' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-surface-container-low rounded-full py-2 pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none"
          />
        </div>
      </div>

      {/* Filter tabs — actually working now */}
      <div className="px-3 flex gap-1.5 mb-2">
        {tabs.map(({ key, label }) => {
          const isActive = activeTab === key;
          const count = key === 'unread' ? totalUnread : 0;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : {}}
            >
              {label}
              {key === 'unread' && count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-on-surface-variant text-sm"
            >
              {activeTab === 'unread' ? 'No unread messages 🎉' :
               activeTab === 'groups' ? 'No groups yet' :
               search ? 'No results found' : 'No conversations yet'}
            </motion.div>
          ) : (
            filtered.map((conv, i) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <ConversationItem conversation={conv} currentUserId={userId} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
