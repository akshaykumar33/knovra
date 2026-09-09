import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Knovra | Universal Project Intelligence Layer',
  description: 'Universal persistent project-intelligence and context layer for AI development agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-mesh-grid" style={{ color: 'var(--text-primary)', margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
          {/* Sticky Left Navigation Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
            <Header />
            <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
