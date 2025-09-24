import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SMMM Mükellef CRM',
  description: 'Serbest Muhasebeci Mali Müşavirler için Multi-tenant CRM Sistemi',
  keywords: ['SMMM', 'CRM', 'Mükellef Yönetimi', 'E-Devlet', 'Mali Müşavir'],
  authors: [{ name: 'SMMM Mükellef CRM' }],
  robots: 'noindex, nofollow', // Development için
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
