'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Phone, Video, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types';
import { useChatStore } from '@/store/useChatStore';
import { generateAvatarUrl, formatLastSeen, getInitials } from '@/lib/utils';

interface Props {
  conversation: Conversation;
  currentUserId: string;
}

export default function ChatHeader({ conversation, currentUserId }: Props) {
  const { onlineUsers, typingUsers } = useChatStore();
  const router = useRouter();

  const otherUser = conversation.participants.find((p) => p._id !== currentUserId);
  const displayName = conversation.isGroup ? conversation.groupName : otherUser?.name;
  const avatarSrc = conversation.isGroup
    ? conversation.groupImage || generateAvatarUrl(conversation.groupName || 'Group')
    : otherUser?.image || '';

  const isOnline = !conversation.isGroup && otherUser && onlineUsers.includes(otherUser._id);
  const typing = typingUsers[conversation._id];
  const isTyping = typing && typing.length > 0;

  let status = '';
  if (isTyping) status = `${typing.map((t) => t.userName).join(', ')} ${typing.length === 1 ? 'is' : 'are'} typing...`;
  else if (isOnline) status = 'Online';
  else if (otherUser?.lastSeen) status = `Last seen ${formatLastSeen(otherUser.lastSeen)}`;
  else if (conversation.isGroup) status = `${conversation.participants.length} members`;

  const initials = getInitials(displayName || 'G');

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-3 md:px-6 py-3 glass-input-bar border-b border-surface-variant/10 shrink-0"
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile back button */}
        <button
          onClick={() => router.push('/chat')}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant mr-1 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative shrink-0">
          {avatarSrc ? (
            <Image src={avatarSrc} alt={displayName || ''} width={40} height={40} className="rounded-full object-cover w-9 h-9 md:w-10 md:h-10" />
          ) : (
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {initials}
            </div>
          )}
          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface online-pulse" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-on-surface text-sm truncate">{displayName}</h2>
          <p className={`text-xs truncate ${isTyping ? 'text-primary italic' : isOnline ? 'text-green-500' : 'text-on-surface-variant'}`}>
            {status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {[Video, Phone, Search, MoreVertical].map((Icon, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
          >
            <Icon className="w-4 h-4" />
          </motion.button>
        ))}
      </div>
    </motion.header>
  );
}
