import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KumbhOS — Predictive Crowd & Infrastructure Intelligence',
  description: 'See the pressure before it becomes a problem.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper-bg font-sans text-paper-text antialiased">{children}</body>
    </html>
  );
}
