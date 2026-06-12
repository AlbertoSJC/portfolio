import type { Metadata } from 'next';
import './globals.css';
import { NotificationToast } from '@/components/NotificationToast';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { CelebrationManager } from '@/components/celebrations/CelebrationManager';
import { SyncManager } from '@/components/sync/SyncManager';
import { Navbar } from '@/components/layout/Navbar';

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <div id="root">{children}</div>
        <NotificationToast />
        <NotificationDrawer />
        <CelebrationManager />
        <SyncManager />
      </body>
    </html>
  );
}
