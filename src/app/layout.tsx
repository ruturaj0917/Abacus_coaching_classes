import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gururaj Coaching Classes',
  description: 'A professional learning platform for performance tracking, analytics, and interactive testing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
