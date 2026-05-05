import type { Metadata } from 'next';
import './globals.css';
import { NotificationToast } from '@/components/NotificationToast';
import { NotificationDrawer } from '@/components/NotificationDrawer';

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
        <NotificationToast />
        <NotificationDrawer />
      </body>
    </html>
  );
}
