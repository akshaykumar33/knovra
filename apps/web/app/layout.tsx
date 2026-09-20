import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';
import '@radix-ui/themes/styles.css';
import './product.css';
import './workspaces.css';
import ProductShell from '../components/ProductShell';
import { ThemeProvider } from '../components/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
  weight: ['400', '500', '600'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'Knovra — Project intelligence',
  description: 'Local project search, context, and persistent knowledge for developers and AI agents.',
};

import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${newsreader.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { const saved = localStorage.getItem('knovra-theme-preference'); document.documentElement.dataset.theme = ['knovra-dark','knovra-light','midnight','graphite','aurora','terminal'].includes(saved) ? saved : 'knovra-dark'; } catch { document.documentElement.dataset.theme = 'knovra-dark'; }`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <ProductShell>{children}</ProductShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'var(--shadow-lg)',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
