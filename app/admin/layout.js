import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#1e202b]">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 min-h-screen bg-[#252736] border-r border-gray-800 p-4">
          <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              Users
            </Link>
            <Link
              href="/admin/withdrawals"
              className="block px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              Withdrawals
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-md text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors mt-4"
            >
              ← Back to App
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
