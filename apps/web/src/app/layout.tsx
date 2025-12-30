import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lash Mama - Luxury Beauty Booking',
  description: 'Premium beauty salon booking app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gold-50 text-dark">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}