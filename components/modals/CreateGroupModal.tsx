"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Search, Check } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useModalStore } from "@/store/useModalStore";
import { useDropzone } from "react-dropzone";
import { generateAvatarUrl } from "@/lib/utils";
import { User } from "@/types";

export default function CreateGroupModal() {
  const { close } = useModalStore();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = details, 2 = members
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users", search],
    queryFn: async () => {
      const res = await axios.get(
        `/api/users${search ? `?search=${search}` : ""}`,
      );
      return res.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: async (files) => {
      if (!files[0]) return;
      const formData = new FormData();
      formData.append("file", files[0]);
      const res = await axios.post("/api/upload", formData);
      setGroupImage(res.data.url);
    },
  });

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedUsers.length < 1) {
      toast.error("Add at least one member");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post("/api/conversations", {
        isGroup: true,
        groupName: groupName.trim(),
        groupDescription: groupDesc,
        groupImage,
        participants: selectedUsers.map((u) => u._id),
      });
      toast.success("Group created!");
      close();
      router.push(`/chat/${res.data._id}`);
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-surface-container rounded-3xl overflow-hidden atmospheric-shadow max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Create New Group
              </h2>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress */}
            <div className="flex gap-2">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "signature-gradient" : "bg-surface-container-high"}`}
                style={
                  step >= 1 ? { background: "var(--signature-gradient)" } : {}
                }
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "" : "bg-surface-container-high"}`}
                style={
                  step >= 2
                    ? { background: "var(--signature-gradient)" }
                    : { background: "#201f1f" }
                }
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar">
            {/* Group photo */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative" {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-dashed border-on-surface-variant/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden">
                  {groupImage ? (
                    <Image
                      src={groupImage}
                      alt="Group"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Camera className="w-7 h-7 text-on-surface-variant" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 signature-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✏️</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                Upload Group Photo
              </p>
            </div>

            {/* Group name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
                Group Name
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Project Apollo"
                className="w-full bg-surface-container-lowest rounded-2xl py-3 px-4 text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
                Description (Optional)
              </label>
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="What's this group about?"
                rows={3}
                className="w-full bg-surface-container-lowest rounded-2xl py-3 px-4 text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none resize-none"
              />
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Add Members
                </label>
                {selectedUsers.length > 0 && (
                  <span className="text-xs font-semibold text-primary">
                    {selectedUsers.length} Selected
                  </span>
                )}
              </div>

              {/* Selected chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedUsers.map((u) => (
                    <motion.div
                      key={u._id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 bg-surface-container-highest rounded-full px-3 py-1.5"
                    >
                      <Image
                        src={u.image || generateAvatarUrl(u.name)}
                        alt={u.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="text-xs font-medium text-on-surface">
                        {u.name}
                      </span>
                      <button
                        onClick={() => toggleUser(u)}
                        className="text-on-surface-variant hover:text-on-surface"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full bg-surface-container-lowest rounded-2xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none"
                />
              </div>

              {/* User list */}
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {users.map((user) => {
                  const selected = selectedUsers.some(
                    (u) => u._id === user._id,
                  );
                  return (
                    <motion.button
                      key={user._id}
                      whileHover={{ x: 2 }}
                      onClick={() => toggleUser(user)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-surface-container-highest transition-colors"
                    >
                      <Image
                        src={user.image || generateAvatarUrl(user.name)}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-on-surface">
                          {user.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {user.bio || "ChatVibe user"}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selected ? "signature-gradient border-transparent" : "border-on-surface-variant/30"}`}
                        style={
                          selected
                            ? { background: "var(--signature-gradient)" }
                            : {}
                        }
                      >
                        {selected && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={creating}
              className="w-full signature-gradient text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {creating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Group"
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
