"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

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
  if (typeof document === "undefined") return;
  const rgb = hexToRgb(accentHex);
  if (!rgb) return;

  // Dim color: mix with black a bit to create a gradient end.
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

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Persisted accent color (saved from Settings)
    try {
      const savedAccent = window.localStorage.getItem("chatvibe:accentColor");
      if (savedAccent) applyAccentToRoot(savedAccent);
    } catch {
      // Some mobile browsers / private mode can throw on localStorage access.
    }
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
