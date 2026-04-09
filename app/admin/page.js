'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaMoneyBillWave, FaChartLine, FaFaucet, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load stats');

      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setRecentWithdrawals(data.recentWithdrawals);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-2xl text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-xs text-green-400 mt-2">{stats?.activeUsers || 0} active</p>
        </div>

        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-2xl text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {(stats?.totalBalance || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Total Balance (SBT)</p>
          <p className="text-xs text-gray-500 mt-2">{(stats?.totalTokens || 0).toFixed(2)} tokens</p>
        </div>

        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <FaFaucet className="text-2xl text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {(stats?.totalBoundTokens || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Bound Tokens</p>
          <p className="text-xs text-gray-500 mt-2">Available for withdrawal</p>
        </div>

        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FaClock className="text-2xl text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats?.pendingWithdrawals || 0}</p>
          <p className="text-sm text-gray-400">Pending Withdrawals</p>
          <p className="text-xs text-gray-500 mt-2">{(stats?.totalWithdrawn || 0).toFixed(2)} total withdrawn</p>
        </div>
      </div>

      {/* Recent Users & Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No users yet</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <span className="text-cyan-400 font-bold text-sm">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-medium">{user.balance.toFixed(2)} SBT</p>
                    <p className="text-xs text-gray-500">Lvl {user.level}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Withdrawals</h2>
          <div className="space-y-3">
            {recentWithdrawals.length === 0 ? (
              <p className="text-gray-400 text-sm">No withdrawals yet</p>
            ) : (
              recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <FaMoneyBillWave className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{withdrawal.user.username}</p>
                      <p className="text-xs text-gray-500">{withdrawal.cryptoCurrency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 text-sm font-medium">{withdrawal.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
