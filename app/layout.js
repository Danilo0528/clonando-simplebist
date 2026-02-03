import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Faucet Simulator - Clone de SimpleBits.io',
  description: 'A faucet simulator platform with multiple earning methods',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xl font-bold text-indigo-600">FaucetSim</span>
                  </div>
                  <nav className="ml-6 flex space-x-8">
                    <a
                      href="/dashboard"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/faucet"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Faucet
                    </a>
                    <a
                      href="/ptc"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      PTC
                    </a>
                    <a
                      href="/shortlinks"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Shortlinks
                    </a>
                    <a
                      href="/mining"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Mining
                    </a>
                    <a
                      href="/economy"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Economy
                    </a>
                    <a
                      href="/withdraw"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Withdraw
                    </a>
                    <a
                      href="/offerwalls"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Offerwalls
                    </a>
                    <a
                      href="/progression"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Progression
                    </a>
                    <a
                      href="/security"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Security
                    </a>
                  </nav>
                </div>
                <div className="flex items-center">
                  <div className="ml-3 relative">
                    <div className="flex space-x-4">
                      <a
                        href="/login"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900"
                      >
                        Sign in
                      </a>
                      <a
                        href="/register"
                        className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Sign up
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
              <div className="mt-4 md:mt-0 md:order-1">
                <p className="text-center text-sm text-gray-500">
                  &copy; 2026 Faucet Simulator. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}