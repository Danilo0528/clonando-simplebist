'use client';

import React from 'react';
import { FaUsers, FaClock, FaCoins, FaBitcoin, FaMicrochip } from 'react-icons/fa';

const BitcoinPoolInfo = () => {
  return (
    // Main container: Minimal padding for the most compact view
    <div className="bg-[#2c2f3b] p-2 rounded-lg shadow-lg mb-4 relative overflow-hidden">
      
      {/* Background radial pattern - minimized */}
      <div 
        className="absolute inset-0 opacity-[0.05] bg-no-repeat bg-center"
        style={{ 
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px), radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '60px 60px, 120px 120px',
        }}
      ></div>

      {/* Content wrapper */}
      <div className="relative z-10">
      
        {/* Header section: Squeezed to minimum */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="bg-orange-500 p-1 rounded-md">
              <FaBitcoin className="text-white text-xs" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Bitcoin Pool</h2>
              <p className="text-gray-400 text-[9px]">Block #19111</p>
            </div>
          </div>
          <button className="border border-gray-700 hover:bg-gray-800 text-white font-semibold py-0.5 px-1.5 rounded text-[9px]">
            Show TOP
          </button>
        </div>
        
        {/* Pool Reward section: Tightly packed */}
        <div className="text-center my-2">
          <div className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gray-400 rounded-full inline-block align-middle"></span>
            <span>6,328.43</span>
          </div>
          <p className="text-gray-500 text-[9px] mt-0.5 tracking-wider">POOL REWARD</p>
        </div>
        
        {/* Stats grid: The most dense arrangement possible */}
        <div className="grid grid-cols-2 gap-x-2">
          
          {/* Left Column */}
          <div className="space-y-1.5">
            {/* Stat Item: Miners */}
            <div className="flex items-center gap-1">
              <FaUsers className="text-xs text-gray-400 w-3.5" />
              <div>
                <p className="font-semibold text-[11px] text-white">309</p>
                <p className="text-gray-400 text-[9px]">Miners</p>
              </div>
            </div>

            {/* Stat Item: Total Power */}
            <div className="flex items-center gap-1">
              <FaMicrochip className="text-xs text-gray-400 w-3.5" />
              <div>
                <p className="font-semibold text-[11px] text-white">37.22 GH</p>
                <p className="text-gray-400 text-[9px]">Total Power</p>
              </div>
            </div>
            
            {/* Stat Item: Time Left */}
            <div className="flex items-center gap-1">
              <FaClock className="text-xs text-gray-400 w-3.5" />
              <div>
                <p className="font-semibold text-[11px] text-white">02:32:51</p>
                <p className="text-gray-400 text-[9px]">Time Left</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-1.5">
            {/* Stat Item: Algorithm */}
            <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-3.5">
                    <p className="font-mono text-gray-400 text-[9px] leading-tight text-center">
                        <b>01</b><br/>10
                    </p>
                </div>
                <div>
                <p className="font-semibold text-[11px] text-white">SHA256</p>
                <p className="text-gray-400 text-[9px]">Algorithm</p>
                </div>
            </div>

            {/* Stat Item: Your Power */}
            <div className="flex items-center gap-1">
                <FaMicrochip className="text-xs text-gray-400 w-3.5" />
                <div>
                <p className="font-semibold text-[11px] text-white">941.68 KH</p>
                <p className="text-gray-400 text-[9px]">Your Power</p>
                </div>
            </div>

            {/* Stat Item: Estimated Reward */}
            <div className="flex items-center gap-1">
                <FaCoins className="text-xs text-gray-400 w-3.5" />
                <div>
                <p className="font-semibold text-[11px] text-white">0.153</p>
                <p className="text-gray-400 text-[9px]">Estimated Reward</p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BitcoinPoolInfo;
