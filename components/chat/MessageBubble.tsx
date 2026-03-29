'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Check, CheckCheck, Trash2, Smile } from 'lucide-react';
import { Message } from '@/types';
import { formatTime, getInitials } from '@/lib/utils';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from '@/providers/SocketProvider';
import { toast } from 'sonner';

interface Props {
  message: Message;
  isSent: boolean;
  isGrouped: boolean;
  currentUserId: string;
  conversationId: string;
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export default function MessageBubble({ message, isSent, isGrouped, currentUserId, conversationId }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();

  const isRead = message.readBy.some((r) => {
    const uid = typeof r.user === 'string' ? r.user : r.user?._id;
    return uid && uid !== currentUserId;
  });

  // ── Delete — update local cache + broadcast via socket ──────────────────────
  const handleDelete = async () => {
    // Optimistic update
    queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
      old.map((m) => m._id === message._id ? { ...m, isDeleted: true, content: '' } : m)
    );

    try {
      await axios.delete(`/api/messages/${message._id}`);

      // Broadcast deletion to other participants
      socket?.emit('delete-message', { conversationId, messageId: message._id });

      // Refresh conversation list (lastMessage may have changed)
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      // Revert optimistic update on failure
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast.error('Failed to delete message');
    }
    setShowActions(false);
  };

  // ── Reaction — update local cache + broadcast via socket ────────────────────
  const handleReaction = async (emoji: string) => {
    setShowReactions(false);
    try {
      const res = await axios.patch(`/api/messages/${message._id}`, { action: 'react', emoji });
      const updatedMessage = res.data;

      // Update local cache
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((m) => m._id === message._id ? updatedMessage : m)
      );

      // Broadcast to other participants
      socket?.emit('react-message', { conversationId, message: updatedMessage });
    } catch {
      toast.error('Failed to add reaction');
    }
  };

  // Group reactions by emoji
  const groupedReactions: Record<string, number> = {};
  message.reactions?.forEach((r) => {
    groupedReactions[r.emoji] = (groupedReactions[r.emoji] || 0) + 1;
  });

  const initials = getInitials(message.sender?.name || '?');

  if (message.isDeleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1 px-2`}
      >
        <span className="text-xs text-on-surface-variant/60 italic px-4 py-2 bg-surface-container rounded-2xl border border-surface-variant/20">
          Message deleted
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isSent ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={`flex ${isSent ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-1 px-2 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      {/* Avatar — only for received, non-grouped */}
      {!isSent ? (
        !isGrouped ? (
          message.sender?.image ? (
            <Image
              src={message.sender.image}
              alt={message.sender.name}
              width={28}
              height={28}
              className="rounded-full object-cover shrink-0 mb-1"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full shrink-0 mb-1 flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {initials}
            </div>
          )
        ) : (
          <div className="w-7 shrink-0" />
        )
      ) : null}

      <div className={`flex flex-col max-w-[65%] ${isSent ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {!isSent && !isGrouped && (
          <span className="text-xs text-on-surface-variant mb-1 ml-2">{message.sender?.name}</span>
        )}

        <div className="relative">
          {/* Hover actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className={`absolute top-1 ${isSent ? 'right-full mr-2' : 'left-full ml-2'} flex items-center gap-1 z-20`}
              >
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center transition-colors shadow-sm"
                >
                  <Smile className="w-3.5 h-3.5 text-on-surface-variant" />
                </button>
                {isSent && (
                  <button
                    onClick={handleDelete}
                    className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-error/20 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-on-surface-variant hover:text-error" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className={`absolute -top-12 ${isSent ? 'right-0' : 'left-0'} flex gap-1 bg-surface-container-high rounded-full px-2 py-1.5 z-30 atmospheric-shadow`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-lg hover:scale-125 transition-transform leading-none"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message bubble */}
          {message.type === 'image' && message.fileUrl ? (
            <div className="rounded-2xl overflow-hidden max-w-[280px]">
              <Image
                src={message.fileUrl}
                alt="Image"
                width={280}
                height={200}
                className="object-cover rounded-2xl"
              />
            </div>
          ) : message.type === 'file' && message.fileUrl ? (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm ${
                isSent ? 'bubble-sent text-white' : 'bubble-received text-on-surface'
              }`}
            >
              📎 {message.content || 'File'}
            </a>
          ) : (
            <div className={`px-4 py-2.5 ${isSent ? 'bubble-sent text-white' : 'bubble-received text-on-surface'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          )}

          {/* Reactions display */}
          {Object.keys(groupedReactions).length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className={`flex gap-1 mt-1 flex-wrap ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              {Object.entries(groupedReactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xs bg-surface-container-high rounded-full px-2 py-0.5 flex items-center gap-0.5 hover:bg-surface-bright transition-colors"
                >
                  {emoji} {count > 1 && <span className="text-on-surface-variant">{count}</span>}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isSent ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-on-surface-variant">{formatTime(message.createdAt)}</span>
          {isSent && (
            isRead
              ? <CheckCheck className="w-3 h-3 text-primary" />
              : <Check className="w-3 h-3 text-on-surface-variant" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
