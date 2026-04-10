import './globals.css';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import ClientWrapper from '../components/ClientWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SimpleBits Clone - Faucet Simulator',
  description: 'A faucet simulator platform with multiple earning methods',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#1e202b] text-white`} suppressHydrationWarning>
        <Suspense fallback={<div className="min-h-screen bg-[#1e202b] flex items-center justify-center text-white">Loading...</div>}>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Suspense>
      </body>
    </html>
  );
}
