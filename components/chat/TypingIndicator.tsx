'use client';
import { motion } from 'framer-motion';

interface Props {
  users: { userId: string; userName: string }[];
}

export default function TypingIndicator({ users }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2 px-2 mb-2"
    >
      <div className="bubble-received px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 bg-on-surface-variant rounded-full block"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
