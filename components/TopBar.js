'use client';

import { FaCoins, FaChevronDown, FaComment } from 'react-icons/fa';

const TopBar = () => {
  const userBalance = '3,984.63';
  const username = 'Kirito0528';
  const userLevelProgress = '75%';

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#1e202b] h-12 flex items-center justify-between px-4 border-b border-gray-800">
        {/* Left placeholder */}
        <div className="w-48"></div>

        {/* Middle */}
        <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2">
                <img src="/images/logo.png" alt="SimpleBits Logo" className="h-7"/>
            </div>
            <button className="bg-black/40 hover:bg-black/60 p-2 rounded-md flex items-center space-x-2">
                <FaCoins className="text-yellow-400" />
                <span className="font-semibold text-sm">{userBalance}</span>
                <FaChevronDown className="text-xs"/>
            </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3 w-48 justify-end">
            <button className="bg-gray-700/50 hover:bg-gray-600/50 p-2 rounded-md">
                <FaComment className="text-lg"/>
            </button>
            <div className="bg-[#2a2c3a] hover:bg-[#303242] p-1 rounded-md flex items-center space-x-2 cursor-pointer">
                <div 
                    className="w-8 h-9 bg-yellow-500/20 border-2 border-yellow-600 flex items-center justify-center font-bold text-xs text-yellow-500"
                    style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}
                >
                    KI
                </div>
                <div className="pr-1">
                    <span className="text-xs font-semibold">{username}</span>
                    <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                        <div className="bg-yellow-400 h-1 rounded-full" style={{ width: userLevelProgress }}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TopBar;
