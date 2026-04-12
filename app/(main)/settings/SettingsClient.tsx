"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Palette,
  Bell,
  Lock,
  User as UserIcon,
  Camera,
  ChevronRight,
  Shield,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { generateAvatarUrl, getInitials } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  username?: string;
  settings?: {
    theme: string;
    accentColor: string;
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    notifications: boolean;
  };
}

const ACCENT_COLORS = [
  { color: "#a8a4ff", label: "Purple" },
  { color: "#ff6b9d", label: "Pink" },
  { color: "#22c55e", label: "Green" },
  { color: "#f59e0b", label: "Amber" },
  { color: "#06b6d4", label: "Cyan" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={value}
      className={`w-11 h-6 rounded-full relative transition-all ${value ? "" : "bg-surface-container-high"}`}
      style={value ? { background: "var(--signature-gradient)" } : {}}
    >
      <motion.span
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full block shadow"
      />
    </button>
  );
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleaned = hex.trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const h = cleaned.startsWith("#") ? cleaned.slice(1) : cleaned;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
};

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

const applyAccentToRoot = (accentHex: string) => {
  const rgb = hexToRgb(accentHex);
  if (!rgb) return;
  const dim = {
    r: clamp(rgb.r * 0.62),
    g: clamp(rgb.g * 0.62),
    b: clamp(rgb.b * 0.62),
  };
  document.documentElement.style.setProperty("--accent-color", accentHex);
  document.documentElement.style.setProperty(
    "--accent-rgb",
    `${rgb.r},${rgb.g},${rgb.b}`,
  );
  document.documentElement.style.setProperty(
    "--accent-dim-rgb",
    `${dim.r},${dim.g},${dim.b}`,
  );
  document.documentElement.style.setProperty(
    "--signature-gradient",
    `linear-gradient(135deg, rgb(${rgb.r},${rgb.g},${rgb.b}), rgb(${dim.r},${dim.g},${dim.b}))`,
  );
};

export default function SettingsClient({ user }: { user: UserData }) {
  const { setTheme, theme: currentTheme } = useTheme();
  const { update } = useSession();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [image, setImage] = useState(user.image || "");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [settings, setSettings] = useState({
    theme: user.settings?.theme || "dark",
    accentColor: user.settings?.accentColor || "#a8a4ff",
    showOnlineStatus: user.settings?.showOnlineStatus ?? true,
    showReadReceipts: user.settings?.showReadReceipts ?? true,
    notifications: user.settings?.notifications ?? true,
  });
  const [saving, setSaving] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    try {
      setImageUploading(true);
      const res = await axios.post("/api/upload", formData);
      setImage(res.data.url);
      setImageVersion(Date.now());
      toast.success("Photo updated!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setImageUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop,
  });

  const handleThemeChange = (t: string) => {
    setSettings((s) => ({ ...s, theme: t }));
    setTheme(t);
  };

  // Apply accent color immediately as a CSS variable on the root element
  const handleAccentColorChange = (color: string) => {
    setSettings((s) => ({ ...s, accentColor: color }));
    applyAccentToRoot(color);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/users/${user._id}`, {
        name,
        bio,
        image,
        settings,
      });
      // Persist accent only after save
      window.localStorage.setItem("chatvibe:accentColor", settings.accentColor);
      // Update next-auth session so avatar/name reflect instantly across the app
      await update({ user: { name, image } });
      toast.success("Settings saved! ✨");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const avatarSrc = image || "";
  const avatarDisplaySrc = avatarSrc
    ? `${avatarSrc}${avatarSrc.includes("?") ? "&" : "?"}v=${imageVersion || "0"}`
    : "";
  const initials = getInitials(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto bg-surface"
    >
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-6">
          Settings
        </h1>

        {/* Profile card */}
        <div className="bg-surface-container rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative cursor-pointer" {...getRootProps()}>
              <input {...getInputProps()} />
              {avatarDisplaySrc ? (
                <Image
                  src={avatarDisplaySrc}
                  alt={name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover w-20 h-20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full signature-gradient flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              {imageUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <div
                className="absolute bottom-0 right-0 w-7 h-7 flex items-center justify-center rounded-full shadow-lg"
                style={{ background: "var(--signature-gradient)" }}
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <div className="flex-1">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 block">
                    Display Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full font-headline font-bold text-xl bg-surface-container-low text-on-surface outline-none rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mt-1">
                {user.username ? `@${user.username}` : user.email}
              </p>
              <div className="mt-2">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 block">
                  Bio
                </label>
                <input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  className="w-full text-sm bg-surface-container-low text-on-surface outline-none rounded-xl px-3 py-1.5 placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <span className="text-xs bg-surface-container-high px-2 py-1 rounded-full text-on-surface-variant mt-2 inline-block">
                Available for chat 💬
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Appearance */}
          <div className="bg-surface-container rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-on-surface">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-on-surface-variant mb-2">Theme</p>
                <div className="flex gap-2 flex-wrap">
                  {["dark", "light", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
                        settings.theme === t
                          ? "text-white shadow-md"
                          : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                      }`}
                      style={
                        settings.theme === t
                          ? { background: "var(--signature-gradient)" }
                          : {}
                      }
                    >
                      {settings.theme === t && <Check className="w-3 h-3" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-on-surface-variant mb-2">
                  Accent Color
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  {ACCENT_COLORS.map(({ color, label }) => (
                    <button
                      key={color}
                      onClick={() => handleAccentColorChange(color)}
                      title={label}
                      className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                        settings.accentColor === color
                          ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-surface-container"
                          : "hover:scale-110"
                      }`}
                      style={{ background: color }}
                    >
                      {settings.accentColor === color && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                  <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-sm font-bold hover:bg-surface-bright transition-colors">
                    +
                  </button>
                </div>
              </div>

              <button className="w-full flex items-center justify-between py-2.5 px-3 bg-surface-container-low rounded-xl text-sm text-on-surface hover:bg-surface-container-high transition-colors">
                <span>Chat Wallpaper</span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-surface-container rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-on-surface">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface">
                  Push Notifications
                </span>
                <Toggle
                  value={settings.notifications}
                  onChange={() => toggleSetting("notifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface">
                  Notification Sounds
                </span>
                <Toggle value={true} onChange={() => {}} />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                  Sound Preset
                </p>
                <button className="w-full flex items-center justify-between py-2.5 px-3 bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors">
                  <span className="text-sm text-on-surface">
                    ChatVibe Default
                  </span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-surface-container rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-on-surface">Privacy</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface">Online Status</span>
                <Toggle
                  value={settings.showOnlineStatus}
                  onChange={() => toggleSetting("showOnlineStatus")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface">Read Receipts</span>
                <Toggle
                  value={settings.showReadReceipts}
                  onChange={() => toggleSetting("showReadReceipts")}
                />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                  Who can see last seen
                </p>
                <button className="w-full flex items-center justify-between py-2.5 px-3 bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors">
                  <span className="text-sm text-on-surface">Everyone</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-surface-container rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-on-surface-variant" />
              <h2 className="font-semibold text-on-surface">Account</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between py-2.5 px-3 bg-surface-container-low rounded-xl text-sm text-on-surface hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-2">
                  <span>🔑</span>
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
              <div className="flex items-center justify-between py-2.5 px-3 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <Shield className="w-4 h-4" />
                  <span>Two-Factor Auth</span>
                </div>
                <Toggle value={false} onChange={() => {}} />
              </div>
              <button className="w-full flex items-center gap-2 py-2.5 px-3 bg-error/10 rounded-xl text-sm text-error hover:bg-error/20 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveProfile}
            disabled={saving}
            className="text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 disabled:opacity-60 shadow-lg"
            style={{ background: "var(--signature-gradient)" }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Changes
          </motion.button>
          <p className="text-xs text-on-surface-variant">
            Changes are saved to your account
          </p>
        </div>
      </div>
    </motion.div>
  );
}
