import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function MainAppLayout({ children }) {
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
