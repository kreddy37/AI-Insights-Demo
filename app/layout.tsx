import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Insights Chat',
  description: 'Chat with our AI agent for insights and recommendations',
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
