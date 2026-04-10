'use client';

import { FaCoins, FaBolt, FaChevronDown } from 'react-icons/fa';
import { useStats } from '../../context/StatsContext';
import { useEffect, useState } from 'react';

const TokenBalances = ({ balances }) => {
  const { userData } = useStats();
  const [displayBalance, setDisplayBalance] = useState(0);
  const [targetBalance, setTargetBalance] = useState(0);

  // ✅ "Falsa progresión" - animación suave en el cliente
  useEffect(() => {
    const currentBalance = balances?.simplebits || userData?.balances?.simplebits || 0;
    setTargetBalance(currentBalance);
    
    // Animación de interpolación
    const animate = () => {
      setDisplayBalance(prev => {
        const diff = currentBalance - prev;
        if (Math.abs(diff) < 0.01) return currentBalance;
        return prev + (diff * 0.1); // 10% por frame
      });
      requestAnimationFrame(animate);
    };
    
    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [balances?.simplebits, userData?.balances?.simplebits]);

  const simplebits = displayBalance || 0;
  const energy = balances?.energy || userData?.balances?.energy || 0;

  return (
    <div className="relative group">
      {/* Main visible button, styled to match the image */}
      <button className="bg-[#0F1014] hover:bg-black/50 pl-2 pr-3 py-1.5 rounded-md flex items-center gap-2 transition-colors duration-200">
        <FaCoins className="text-yellow-400" />
        <span className="font-semibold text-sm text-white">
          {simplebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <FaChevronDown className="text-xs text-gray-400"/>
      </button>

      {/* Polished Dropdown menu */}
      <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-56 bg-[#2a2c3a] rounded-md shadow-lg py-1 z-50 border border-gray-700">
        <div className="px-3 py-2 border-b border-gray-700">
            <span className="text-xs font-semibold text-gray-400">Your Balances</span>
        </div>
        <div className="py-1">
            <div className="px-3 py-2 flex justify-between items-center text-sm text-white">
                <span className="flex items-center gap-2">
                <FaCoins className="text-yellow-400" /> SimpleBits (SBT)
                </span>
                <span className="font-mono">{simplebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="px-3 py-2 flex justify-between items-center text-sm text-white">
                <span className="flex items-center gap-2">
                <FaBolt className="text-blue-400" /> Energy
                </span>
                <span className="font-mono">{Math.round(energy)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBalances;
