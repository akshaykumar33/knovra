import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
      <body className="bg-mesh-grid" style={{ color: 'var(--text-primary)', margin: 0, padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Swivora-style Sticky Frosted Top Navbar */}
        <Navbar />

        {/* Full-width Centered Main Canvas */}
        <main
          style={{
            flex: 1,
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
            padding: '2.5rem 2rem',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>

        {/* Swivora-style Structured Footer */}
        <Footer />
      </body>
    </html>
  );
}
