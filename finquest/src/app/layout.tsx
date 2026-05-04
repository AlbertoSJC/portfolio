import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinQuest - Gamified Personal Finance Adventure',
  description: 'Transform your financial goals into an exciting adventure game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
