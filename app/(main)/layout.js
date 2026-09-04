import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function MainAppLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[0_1fr] md:grid-cols-[var(--sidebar-width)_1fr] grid-rows-[var(--navbar-height)_1fr]">
      <div className="col-span-2 z-40">
        <TopBar />
      </div>
      <div className="hidden md:block z-30">
        <Sidebar />
      </div>
      <main className="col-start-1 col-end-3 md:col-start-2 overflow-y-auto p-4 md:p-6 bg-[#1e202b]">
        {children}
        <footer className="py-3 text-xs border-t border-gray-800 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="mb-2 md:mb-0">&copy; 2024 SimpleBits Clone. All rights reserved.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-cyan-400">Terms</a>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">Privacy</a>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">Contact</a>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}
