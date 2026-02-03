'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MiningPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [miningLoading, setMiningLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeAmount, setUpgradeAmount] = useState(1);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMiningStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchMiningStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMiningStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/mining/action', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mining stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching mining stats:', error);
      setMessage('Error loading mining stats');
    } finally {
      setLoading(false);
    }
  };

  const handleMine = async () => {
    setMiningLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/mining/action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to mine');
        return;
      }

      setMessage(`Mining action successful! Contributed ${data.hashpowerContribution} hashpower.`);
      fetchMiningStats(); // Refresh stats
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (error) {
      console.error('Error mining:', error);
      setMessage('Error mining');
    } finally {
      setMiningLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setClaimLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/mining/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to claim rewards');
        return;
      }

      setMessage(data.message);
      fetchMiningStats(); // Refresh stats
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (error) {
      console.error('Error claiming rewards:', error);
      setMessage('Error claiming rewards');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUpgradeHashpower = async () => {
    if (upgradeAmount <= 0) {
      setMessage('Upgrade amount must be greater than 0');
      return;
    }

    setUpgradeLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/mining/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseInt(upgradeAmount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to upgrade hashpower');
        return;
      }

      setMessage(`Hashpower upgraded by ${data.cost / 10} units for ${data.cost} tokens.`);
      setUpgradeAmount(1);
      fetchMiningStats(); // Refresh stats
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (error) {
      console.error('Error upgrading hashpower:', error);
      setMessage('Error upgrading hashpower');
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading mining dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Unable to load mining stats</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mining Center</h1>
        
        {/* Current Pool Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Mining Pool</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Pool ID</p>
              <p className="font-medium">{stats.currentPool.id}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Ends at</p>
              <p className="font-medium">{new Date(stats.currentPool.endTime).toLocaleString()}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Reward</p>
              <p className="font-medium">{stats.currentPool.totalRewards} tokens</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Total Hashpower in Pool</p>
            <p className="text-lg font-medium">{stats.currentPool.totalHashpower}</p>
          </div>
        </div>
        
        {/* User Stats */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Mining Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Virtual Hashpower</p>
              <p className="font-medium">{stats.userStats.hashpowerVirtual}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Energy Points</p>
              <p className="font-medium">{stats.userStats.energyPoints}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Pool Contribution</p>
              <p className="font-medium">{stats.userContribution?.contributedHashpower || 0}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">Potential Reward</p>
              <p className="font-medium">{stats.userContribution?.potentialReward?.toFixed(6) || 0} tokens</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleMine}
              disabled={miningLoading || stats.userStats.energyPoints < 10}
              className={`px-6 py-3 rounded-lg font-medium ${
                miningLoading || stats.userStats.energyPoints < 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {miningLoading ? 'Mining...' : 
                stats.userStats.energyPoints < 10 ? 'Not enough energy' : 'Mine (+10 energy cost)'}
            </button>
            
            <button
              onClick={handleClaimRewards}
              disabled={claimLoading}
              className="ml-4 px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {claimLoading ? 'Claiming...' : 'Claim Rewards'}
            </button>
          </div>
        </div>
        
        {/* Upgrade Hashpower */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upgrade Hashpower</h2>
          
          <p className="text-gray-600 mb-4">Increase your virtual hashpower to earn more from mining. Cost: 10 tokens per unit.</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              min="1"
              value={upgradeAmount}
              onChange={(e) => setUpgradeAmount(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Amount to upgrade"
            />
            <button
              onClick={handleUpgradeHashpower}
              disabled={upgradeLoading}
              className="px-6 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {upgradeLoading ? 'Upgrading...' : `Upgrade (${upgradeAmount * 10} tokens)`}
            </button>
          </div>
        </div>
        
        {/* How Mining Works */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How Mining Works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>New mining pools start every 8 hours</li>
            <li>Contribute hashpower to pools to earn rewards</li>
            <li>Your rewards depend on your share of the total pool hashpower</li>
            <li>Pools pay out rewards when they end</li>
            <li>Upgrade your virtual hashpower to increase earnings</li>
            <li>Mining costs energy points that regenerate over time</li>
          </ul>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('Success') || message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}