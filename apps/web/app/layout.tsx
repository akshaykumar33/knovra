import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
