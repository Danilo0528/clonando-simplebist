import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AuthLayout({ children }) {
  return (
    <div className={`min-h-screen bg-[#1e202b] text-white ${inter.className}`}>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}