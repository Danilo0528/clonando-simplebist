import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SimpleBits Clone - Faucet Simulator',
  description: 'A faucet simulator platform with multiple earning methods',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#1e202b] text-white`}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
