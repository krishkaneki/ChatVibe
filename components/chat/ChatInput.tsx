'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Smile, Send, X, ImageIcon, FileText } from 'lucide-react';
import { useSocketContext } from '@/providers/SocketProvider';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Props {
  conversationId: string;
  currentUserId: string;
}

const EMOJI_QUICK = ['😊', '😂', '❤️', '👍', '🔥', '😮', '😢', '🎉', '✨', '💯', '🙏', '😎'];

export default function ChatInput({ conversationId, currentUserId }: Props) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const typingTimeout = useRef<NodeJS.Timeout>();
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Typing indicators ────────────────────────────────────────────────────────
  const stopTyping = useCallback(() => {
    if (isTyping) {
      socket?.emit('typing-stop', { conversationId, userId: currentUserId });
      setIsTyping(false);
    }
  }, [isTyping, socket, conversationId, currentUserId]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      socket?.emit('typing-start', {
        conversationId,
        userId: currentUserId,
        userName: session?.user?.name || 'Someone',
      });
      setIsTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 2000);
  }, [isTyping, socket, conversationId, currentUserId, session, stopTyping]);

  useEffect(() => () => clearTimeout(typingTimeout.current), []);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (
    msgContent = content,
    type: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string
  ) => {
    const trimmed = msgContent.trim();
    if (!trimmed && !fileUrl) return;
    setIsSending(true);
    stopTyping();

    try {
      const res = await axios.post('/api/messages', {
        conversationId,
        content: trimmed,
        type,
        fileUrl,
      });

      const msg = res.data;

      // Add to local cache immediately (sender sees it right away)
      queryClient.setQueryData<unknown[]>(['messages', conversationId], (old = []) => {
        const arr = old as { _id: string }[];
        if (arr.some((m) => m._id === msg._id)) return old;
        return [...arr, msg];
      });

      // Broadcast to other participants via socket
      // IMPORTANT: include conversationId as a top-level field so receivers
      // can filter by conversation in their handleNewMessage handler
      socket?.emit('send-message', {
        ...msg,
        conversationId, // explicit field — msg.conversation is an ObjectId string
      });

      // Refresh conversation list sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [content, conversationId, socket, queryClient, stopTyping]);

  // ── File upload ──────────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    setUploadProgress(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/upload', formData);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      await sendMessage(file.name, type, res.data.url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadProgress(false);
    }
  }, [sendMessage]);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTyping();
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`shrink-0 border-t border-surface-variant/10 transition-colors ${
        dragOver ? 'bg-primary/5 border-primary/30' : 'glass-input-bar'
      }`}
    >
      {/* Drag overlay hint */}
      {dragOver && (
        <div className="px-4 py-2 text-center text-xs text-primary font-medium">
          Drop file to send
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress && (
        <div className="px-4 py-1.5 flex items-center gap-2 text-xs text-on-surface-variant">
          <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Uploading file...
        </div>
      )}

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="px-4 pt-3 pb-1 flex gap-1.5 flex-wrap"
          >
            {EMOJI_QUICK.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                  setContent((c) => c + emoji);
                  textareaRef.current?.focus();
                  setShowEmoji(false);
                }}
                className="text-xl leading-none p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
            <button
              type="button"
              onClick={() => setShowEmoji(false)}
              className="ml-auto p-1 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="flex items-end gap-2 px-3 py-3">

        {/* Attachment button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadProgress}
          title="Attach file or image"
          className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all shrink-0 disabled:opacity-40"
        >
          <Paperclip className="w-5 h-5" />
        </motion.button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf,.txt,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadFile(file);
              // Reset so the same file can be selected again
              e.target.value = '';
            }
          }}
        />

        {/* Text area */}
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-surface-container-low rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none resize-none no-scrollbar leading-relaxed"
            style={{ maxHeight: '120px', minHeight: '40px' }}
          />
        </div>

        {/* Emoji button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          title="Emoji"
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 ${
            showEmoji
              ? 'bg-primary/20 text-primary'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92, rotate: 10 }}
          type="button"
          onClick={() => sendMessage()}
          disabled={isSending || (!content.trim() && !uploadProgress)}
          title="Send message"
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
