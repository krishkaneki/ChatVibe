import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import QueryProvider from '@/providers/QueryProvider';
import AuthProvider from '@/providers/AuthProvider';
import ThemeProvider from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'ChatVibe | Connect. Chat. Vibe.',
  description: 'Real-time chat application. Connect with friends and vibe together.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-surface-container-lowest font-body text-on-surface antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1a1919',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: '#ffffff',
                  },
                }}
              />
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
