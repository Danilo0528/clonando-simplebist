'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token found, redirect to login
      router.push('/auth/login');
      return;
    }

    // Verify token exists and is valid (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        // Token expired, remove it and redirect to login
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }
      
      // Token is valid
      setIsAuthenticated(true);
    } catch (error) {
      // Invalid token format, redirect to login
      localStorage.removeItem('token');
      router.push('/auth/login');
    }
  }, [router]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Checking authentication...</div>
      </div>
    );
  }

  // If not authenticated, show a loading state while redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  // If authenticated, show the full layout
  return (
    <>
      <TopBar />
      <Sidebar />
      <div className="pt-12 md:pl-64 h-full">
          <main className="flex-grow p-4 md:p-6">
            {children}
          </main>
          <footer className="py-3 text-xs border-t border-gray-800">
            <div className="px-4 md:px-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="mb-2 md:mb-0">&copy; 2024 SimpleBits Clone. All rights reserved.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-cyan-400">Terms</a>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">Privacy</a>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">Contact</a>
                </div>
              </div>
            </div>
          </footer>
      </div>
    </>
  );
}