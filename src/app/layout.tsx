import type {Metadata} from 'next';
import './globals.css';
import { InvitationProvider } from '@/context/invitation-context';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Invite Canvas',
  description: 'Create and customize beautiful invitations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <InvitationProvider>
          {children}
        </InvitationProvider>
      </body>
    </html>
  );
}
