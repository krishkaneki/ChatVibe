'use client';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Conversation } from '@/types';
import { useChatStore } from '@/store/useChatStore';
import { formatTime, getInitials, truncate } from '@/lib/utils';

interface Props {
  conversation: Conversation;
  currentUserId: string;
}

export default function ConversationItem({ conversation, currentUserId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { onlineUsers, typingUsers } = useChatStore();

  const isActive = pathname === `/chat/${conversation._id}`;
  const otherUser = conversation.participants.find((p) => p._id !== currentUserId);
  const displayName = conversation.isGroup ? conversation.groupName : otherUser?.name;
  const avatarSrc = conversation.isGroup
    ? conversation.groupImage || ''
    : otherUser?.image || '';

  const isOnline = !conversation.isGroup && otherUser && onlineUsers.includes(otherUser._id);
  const typing = typingUsers[conversation._id];
  const isTyping = typing && typing.length > 0;
  const unread = conversation.unreadCount ?? 0;
  const hasUnread = unread > 0 && !isActive;

  const lastMsg = conversation.lastMessage;
  let preview = '';
  if (isTyping) {
    preview = `${typing[0].userName} is typing...`;
  } else if (lastMsg) {
    if (lastMsg.type === 'image') preview = '📷 Photo';
    else if (lastMsg.type === 'file') preview = '📎 File';
    else preview = truncate(lastMsg.content, 32);
  }

  const initials = getInitials(displayName || '?');

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={() => router.push(`/chat/${conversation._id}`)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
        isActive
          ? 'bg-surface-container border-l-2 border-primary'
          : hasUnread
            ? 'bg-primary/5 hover:bg-primary/10'
            : 'hover:bg-surface-container/50'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={displayName || 'Chat'}
            width={44}
            height={44}
            className="rounded-full object-cover w-11 h-11"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            {initials}
          </div>
        )}

        {/* Online dot */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-lowest online-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm truncate ${
            hasUnread ? 'font-bold text-on-surface' : isActive ? 'font-semibold text-white' : 'font-medium text-on-surface'
          }`}>
            {displayName}
          </span>
          <span className={`text-[11px] shrink-0 ${hasUnread ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
            {lastMsg ? formatTime(lastMsg.createdAt) : ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className={`text-xs truncate ${
            isTyping ? 'text-primary italic' :
            hasUnread ? 'text-on-surface font-medium' :
            'text-on-surface-variant'
          }`}>
            {preview || 'Start chatting'}
          </p>

          {/* Unread badge */}
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="ml-1 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
