import type {Metadata} from 'next';
import './globals.css';
import { InvitationProvider } from '@/context/invitation-context';
import { Playfair_Display, Lora } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontBody = Lora({
  subsets: ['latin'],
  variable: '--font-body',
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
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontHeadline.variable, fontBody.variable)}>
        <InvitationProvider>
          {children}
        </InvitationProvider>
      </body>
    </html>
  );
}
