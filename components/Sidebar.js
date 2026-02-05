'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserStatus from './sidebar/UserStatus';
import TabButtons from './sidebar/TabButtons';
import EquipmentPanel from './sidebar/EquipmentPanel';
import StatsPanel from './sidebar/StatsPanel';
import BeltPanel from './sidebar/BeltPanel';
import DailyReward from './sidebar/DailyReward';
import {
  FaTachometerAlt, FaWallet, FaEye, FaFaucet, FaLink, FaTrophy, 
  FaMoneyBillWave, FaMicrochip, FaHammer, FaBox, FaShoppingCart, FaGamepad, 
  FaPlusCircle, FaBars, FaTimes, FaRocket, FaCube, 
  FaBullhorn, FaCrown, FaChevronDown, FaListAlt
} from 'react-icons/fa';

// Reordered and updated for better UX
const navItems = [
    // Core
    { href: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { href: '/wallet', label: 'Wallet', icon: <FaWallet /> },
    
    // Earning
    { href: '/faucet', label: 'Faucet', icon: <FaFaucet /> },
    { href: '/offerwalls', label: 'Offerwalls', icon: <FaListAlt /> },
    { href: '/ptc', label: 'PTC', icon: <FaEye /> },
    { href: '/shortlinks', label: 'Shortlinks', icon: <FaLink /> },
    { href: '/mining', label: 'Mining', icon: <FaHammer /> },
    { href: '/challenges', label: 'Challenges', icon: <FaTrophy /> },

    // Management
    { href: '/hardware', label: 'Hardware', icon: <FaMicrochip /> },
    { href: '/inventory', label: 'Inventory', icon: <FaBox /> },
    { href: '/fund', label: 'Fund', icon: <FaMoneyBillWave /> },

    // Community & Extras
    { href: '/market', label: 'Market', icon: <FaShoppingCart />, dropdown: true },
    { href: '/games',label: 'Games', icon: <FaGamepad />, dropdown: true },
    { 
      href: '/other', 
      label: 'Other', 
      icon: <FaPlusCircle />, 
      dropdown: true, 
      extraIcons: [
        <FaBullhorn key="bullhorn" className="text-green-400"/>, 
        <FaCrown key="crown" className="text-yellow-500"/>
      ]
    },
];

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const pathname = usePathname();

  const handleTabClick = (tab) => {
    setActiveTab(prevTab => (prevTab === tab ? null : tab));
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-16 left-4 z-50 p-2 rounded-md bg-surface-800 text-white"
        aria-label="Open sidebar"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`fixed top-12 left-0 h-[calc(100vh-3rem)] bg-[#252736] text-gray-300 z-30 transform transition-transform duration-300 ease-in-out w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col border-r border-surface-700`}>
        
        <UserStatus />

        <div className="p-2 border-b border-surface-700">
          <TabButtons activeTab={activeTab} onTabClick={handleTabClick} />
        </div>

        {activeTab && (
            <div className="p-3 border-b border-surface-700 animate-fade-in-down">
                {activeTab === 'equipment' && <EquipmentPanel />}
                {activeTab === 'stats' && <StatsPanel />}
                {activeTab === 'belt' && <BeltPanel />}
            </div>
        )}

        <nav className="flex-grow p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => sidebarOpen && setSidebarOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-md text-sm transition-colors duration-200 ${pathname === item.href ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-surface-700 hover:text-white'}`}>
                  <div className='flex items-center'>
                    <span className="w-6">{item.icon}</span>
                    <span className='text-xs'>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.extraIcons}
                    {item.status && <span className='text-xs font-bold text-yellow-400 bg-surface-700 px-1.5 py-0.5 rounded'>{item.status}</span>}
                    {item.dropdown && <FaChevronDown className="text-gray-500 text-xs"/>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <DailyReward />

        <div className="p-2 border-t border-surface-700 flex gap-1">
            <button className='flex-1 flex items-center justify-center gap-2 bg-[#191b24] hover:border-gray-500 py-2.5 px-2 rounded-md text-sm border border-dashed border-surface-600 text-gray-300'>
                <FaRocket />
                BOOSTS
            </button>
            <button className='flex-1 flex items-center justify-center gap-2 bg-[#191b24] hover:border-gray-500 py-2.5 px-2 rounded-md text-sm border border-dashed border-surface-600 text-gray-300'>
                <FaCube />
                DROPS
            </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
        </div>
      )}
    </>
  );
};

export default Sidebar;
