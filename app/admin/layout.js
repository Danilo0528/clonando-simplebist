'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaMoneyBillWave, FaChartLine, FaBullhorn, FaCog, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token en localStorage:', token ? 'ENCONTRADO' : 'NO ENCONTRADO');
      
      if (!token) {
        console.log('❌ No hay token, redirigiendo a /auth/login');
        router.push('/auth/login');
        return;
      }

      console.log('📡 Llamando a /api/user con token...');
      const res = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Respuesta de /api/user:', res.status);

      if (!res.ok) {
        console.log('❌ Error en /api/user:', res.status, 'redirigiendo a /auth/login');
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      console.log('👤 Datos del usuario:', JSON.stringify(data, null, 2));
      console.log('🛡️ isAdmin:', data.isAdmin);

      if (!data.isAdmin) {
        console.log('❌ No es admin, redirigiendo a /dashboard');
        router.push('/dashboard');
        return;
      }

      console.log('✅ Admin verificado correctamente');
      setIsAdmin(true);
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('token');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#1e202b] flex items-center justify-center">
        <div className="text-white">Loading admin panel...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <FaChartLine /> },
    { href: '/admin/announcements', label: 'Announcements', icon: <FaBullhorn /> },
    { href: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: <FaMoneyBillWave /> },
    { href: '/admin/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen bg-[#1e202b]">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 min-h-screen bg-[#252736] border-r border-gray-800 p-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-gray-400 mt-1">Manage your platform</p>
          </div>
          
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 pt-4 border-t border-gray-700">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              <FaArrowLeft />
              Back to App
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
