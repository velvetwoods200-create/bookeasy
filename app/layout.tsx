import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookEasy — Appointment Booking for Small Businesses',
  description:
    'The simplest way for small businesses to accept online appointment bookings. Set up your booking page in minutes.',
  openGraph: {
    title: 'BookEasy',
    description: 'Simple appointment booking for modern businesses.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
