'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { MessageSquare, Users, Settings, LogOut, Plus, Menu, X } from 'lucide-react';
import type { Session } from 'next-auth';
import { useChatStore } from '@/store/useChatStore';
import { useSocketContext } from '@/providers/SocketProvider';
import { useModalStore } from '@/store/useModalStore';
import ConversationList from './ConversationList';
import CreateGroupModal from '@/components/modals/CreateGroupModal';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';

interface SidebarProps { session: Session; }

const navItems = [
  { href: '/chat', icon: MessageSquare, label: 'Chats' },
  { href: '/contacts', icon: Users, label: 'Groups' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const { data: liveSession } = useSession();
  const { socket } = useSocketContext();
  const { setOnlineUsers, addOnlineUser, removeOnlineUser } = useChatStore();
  const { open, type } = useModalStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const effectiveSession = liveSession ?? session;
  const userId = (effectiveSession.user as { id?: string })?.id;

  useEffect(() => {
    if (!socket) return;
    socket.on('online-users', setOnlineUsers);
    socket.on('user-connected', addOnlineUser);
    socket.on('user-disconnected', removeOnlineUser);
    return () => {
      socket.off('online-users');
      socket.off('user-connected');
      socket.off('user-disconnected');
    };
  }, [socket]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const initials = getInitials(effectiveSession.user?.name || 'U');
  const avatarSrc = (effectiveSession.user as { image?: string } | undefined)?.image || '';
  const avatarDisplaySrc = avatarSrc
    ? `${avatarSrc}${avatarSrc.includes('?') ? '&' : '?'}v=${avatarVersion || '0'}`
    : '';

  // Cache-bust sidebar avatar when the image URL changes
  useEffect(() => {
    if (avatarSrc) setAvatarVersion(Date.now());
  }, [avatarSrc]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {avatarDisplaySrc ? (
              <Image src={avatarDisplaySrc} alt={effectiveSession.user?.name || 'User'} width={36} height={36} className="rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full signature-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-lowest online-pulse" />
          </div>
          <span className="font-headline font-bold text-lg text-gradient">ChatVibe</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-on-surface-variant p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Message */}
      <div className="px-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => open('createGroup')}
          className="w-full signature-gradient text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New Message
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/chat'
              ? pathname === '/chat' || pathname.startsWith('/chat/')
              : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} prefetch={true}>
              <motion.div
                whileHover={{ x: 3 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-surface-container text-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{label}</span>
                {isActive && (
                  <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Conversation list */}
      <div className="flex-1 overflow-hidden mt-4">
        <ConversationList userId={userId || ''} />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-surface-variant/10">
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center shadow-lg text-on-surface-variant"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[280px] flex-shrink-0 h-full flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      {type === 'createGroup' && <CreateGroupModal />}
    </>
  );
}
