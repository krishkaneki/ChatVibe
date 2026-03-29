'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { Search, MessageCircle, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generateAvatarUrl } from '@/lib/utils';
import { useModalStore } from '@/store/useModalStore';
import CreateGroupModal from '@/components/modals/CreateGroupModal';
import { User } from '@/types';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { open, type } = useModalStore();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users', search],
    queryFn: async () => {
      const res = await axios.get(`/api/users${search ? `?search=${search}` : ''}`);
      return res.data;
    },
    enabled: true,
  });

  const startChat = async (userId: string) => {
    try {
      const res = await axios.post('/api/conversations', { participantId: userId });
      router.push(`/chat/${res.data._id}`);
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-6 bg-surface"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Find People</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => open('createGroup')}
          className="flex items-center gap-2 signature-gradient text-white text-sm font-semibold px-4 py-2 rounded-full"
        >
          <Users className="w-4 h-4" />
          New Group
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-surface-container-low rounded-2xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none"
        />
      </div>

      {/* Users grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-container rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full skeleton-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton-shimmer rounded" />
                <div className="h-2 w-32 skeleton-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {users.map((user, i) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container rounded-2xl p-4 flex items-center gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="relative shrink-0">
                  <Image
                    src={user.image || generateAvatarUrl(user.name)}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container online-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm truncate">{user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.bio || user.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => startChat(user._id)}
                  className="w-9 h-9 signature-gradient rounded-full flex items-center justify-center shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {users.length === 0 && (
            <div className="col-span-3 text-center py-16 text-on-surface-variant">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      )}

      {type === 'createGroup' && <CreateGroupModal />}
    </motion.div>
  );
}
