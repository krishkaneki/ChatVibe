'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Camera, Edit2, Save, MessageSquare, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { getInitials, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface UserData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  username?: string;
  createdAt: string;
}

export default function ProfileClient({ user }: { user: UserData }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "Hey there! I'm using ChatVibe");
  const [username, setUsername] = useState(user.username || '');
  const [image, setImage] = useState(user.image || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    const formData = new FormData();
    formData.append('file', files[0]);
    try {
      const res = await axios.post('/api/upload', formData);
      setImage(res.data.url);
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ accept: { 'image/*': [] }, maxFiles: 1, onDrop });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/users/${user._id}`, { name, bio, username: username || undefined, image });
      toast.success('Profile saved! ✨');
      setEditing(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const initials = getInitials(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto bg-surface"
    >
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Profile header card */}
        <div className="bg-surface-container rounded-3xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 md:h-36" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <div className="h-full dot-pattern opacity-30" />
          </div>

          {/* Avatar + info */}
          <div className="px-5 pb-5 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="relative w-fit" {...getRootProps()}>
                <input {...getInputProps()} />
                {image ? (
                  <Image
                    src={image}
                    alt={name}
                    width={88}
                    height={88}
                    className="rounded-2xl object-cover border-4 border-surface-container shadow-lg w-20 h-20 md:w-22 md:h-22"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-[88px] md:h-[88px] rounded-2xl border-4 border-surface-container shadow-lg flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-surface-container-high text-on-surface text-sm font-semibold px-4 py-2 rounded-xl hover:bg-surface-bright transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                )}
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-surface-container-high text-on-surface text-sm font-semibold px-4 py-2 rounded-xl hover:bg-surface-bright transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </motion.button>
                </Link>
              </div>
            </div>

            <div className="mt-4">
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-headline font-bold text-2xl bg-surface-container-low text-on-surface outline-none rounded-xl px-3 py-1.5 w-full mb-1 focus:ring-2 focus:ring-primary/30"
                />
              ) : (
                <h1 className="font-headline font-bold text-2xl text-on-surface">{name}</h1>
              )}

              {editing ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-on-surface-variant text-sm">@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="text-sm bg-surface-container-low text-on-surface-variant outline-none rounded-xl px-2 py-1 focus:ring-2 focus:ring-primary/30 flex-1"
                  />
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm mt-0.5">{username ? `@${username}` : user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-surface-container rounded-2xl p-5 mb-4">
          <h2 className="font-semibold text-on-surface mb-3">About</h2>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="Tell people about yourself..."
              className="w-full text-sm bg-surface-container-low text-on-surface outline-none rounded-xl px-3 py-2.5 placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/30 resize-none"
            />
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed">{bio || 'No bio yet.'}</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-surface-container rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-on-surface mb-3">Info</h2>
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <Mail className="w-4 h-4 shrink-0 text-primary" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <Calendar className="w-4 h-4 shrink-0 text-primary" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* Go to settings link */}
        <div className="mt-4 text-center">
          <Link href="/settings" className="text-sm text-primary hover:text-primary-dim transition-colors">
            ⚙️ Go to full Settings
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
