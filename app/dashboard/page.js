'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initRealtimeUpdates, subscribeToBalanceUpdates } from '../../lib/realtime';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    // Initialize real-time updates
    initRealtimeUpdates();
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const profileData = await profileResponse.json();
        setUser(profileData.user);

        // Fetch user balances
        const balancesResponse = await fetch('/api/user/balances', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!balancesResponse.ok) {
          throw new Error('Failed to fetch balances');
        }

        const balancesData = await balancesResponse.json();
        setBalances(balancesData.balances);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Subscribe to balance updates
    const handleBalanceUpdate = (data) => {
      setBalances(prev => ({
        ...prev,
        tokenBalance: data.balance.tokenBalance,
        boundTokenBalance: data.balance.boundTokenBalance,
      }));
      setLastUpdated(new Date());
    };
    
    subscribeToBalanceUpdates(handleBalanceUpdate);
    
    // Refresh data every 5 minutes in case of missed events
    const interval = setInterval(fetchUserData, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!user || !balances) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Unable to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="font-medium">{user.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience Points</p>
              <p className="font-medium">{user.xp}</p>
            </div>
          </div>
        </div>

        {/* Balances Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Internal Tokens</p>
              <p className="text-2xl font-bold text-blue-600">{balances.tokenBalance?.toFixed(8)}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Bound Tokens</p>
              <p className="text-2xl font-bold text-green-600">{balances.boundTokenBalance?.toFixed(8)}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Energy Points</p>
              <p className="text-2xl font-bold text-yellow-600">{balances.energyPoints}</p>
            </div>
          </div>
        </div>

        {/* Virtual Hashpower Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mining Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Virtual Hashpower</p>
              <p className="text-lg font-medium">{balances.hashpowerVirtual?.toFixed(8)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}