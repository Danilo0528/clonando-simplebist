import './globals.css';
import { Inter } from 'next/font/google';
import ClientWrapper from '../components/ClientWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SimpleBits Clone - Faucet Simulator',
  description: 'A faucet simulator platform with multiple earning methods',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#1e202b] text-white`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
