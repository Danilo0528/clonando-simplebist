'use client';

import { useState, useEffect } from 'react';
import { useStats } from '../context/StatsContext';
import TokenBalances from './topbar/TokenBalances';
import UserActions from './topbar/UserActions';
import PotentialEarnings from './topbar/PotentialEarningsDetailed';
import Logo from './Logo';

// Componente alternativo para TopBar con manejo mejorado de autenticación
const TopBarFixed = () => {
  const { userData, loading } = useStats();

  // Listen for balance updates to force refresh if needed
  useEffect(() => {
    const handleBalanceUpdate = () => {
      // The context already handles updates, but we can add any additional logic here if needed
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => window.removeEventListener('balanceUpdated', handleBalanceUpdate);
  }, []);

  // Construct the balances object that the TokenBalances component expects
  const balances = userData ? {
    simplebits: userData.balances?.simplebits || userData.balances?.sc || 0,
    energy: userData.balances?.energy || 0
  } : null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#1e202b] border-b border-gray-800">
        <div className="h-16 flex items-center justify-between px-6">
             
             {/* Left Side: Logo + Balances */}
             <div className="flex items-center gap-6">
                <Logo />
                {/* Only show balances if not loading and user exists */}
                {!loading && balances && <TokenBalances balances={balances} />}
             </div>

            {/* Center: Potential Earnings */}
            <div className="flex items-center">
               {!loading && userData && <PotentialEarnings user={userData} />}
            </div>
            
            {/* Right Side: User Profile */}
            <div className="flex items-center">
                {/* Pass user state to UserActions */}
                {!loading && <UserActions user={userData || null} />}
            </div>
        </div>
    </div>
  );
};

export default TopBarFixed;