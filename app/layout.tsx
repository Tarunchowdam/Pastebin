import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pastebin - Share Text Securely',
  description: 'A text-sharing application with optional expiry constraints',
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