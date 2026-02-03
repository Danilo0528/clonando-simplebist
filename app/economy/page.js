'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EconomyPage() {
  const [balances, setBalances] = useState(null);
  const [conversion, setConversion] = useState({ amount: '', fromType: 'internal', toType: 'bound' });
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState('');
  const [economyStats, setEconomyStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchBalances();
    fetchEconomyStats();
  }, []);

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/balances', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }

      const data = await response.json();
      setBalances(data.balances);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setMessage('Error loading balances');
    }
  };

  const fetchEconomyStats = async () => {
    try {
      const response = await fetch('/api/economy/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch economy stats');
      }

      const data = await response.json();
      setEconomyStats(data.stats);
    } catch (error) {
      console.error('Error fetching economy stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversion = async (e) => {
    e.preventDefault();
    
    if (!conversion.amount || parseFloat(conversion.amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (conversion.fromType === conversion.toType) {
      setMessage('Cannot convert to the same type');
      return;
    }

    setConverting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/economy/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(conversion.amount),
          fromType: conversion.fromType,
          toType: conversion.toType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to convert tokens');
        return;
      }

      setMessage(data.message);
      fetchBalances(); // Refresh balances
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (error) {
      console.error('Error converting tokens:', error);
      setMessage('Error converting tokens');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading economy...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Economy</h1>
        
        {/* User Balances */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Balances</h2>
          
          {balances && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Internal Tokens</p>
                <p className="text-2xl font-bold text-blue-600">{balances.tokenBalance?.toFixed(8)}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Bound Tokens</p>
                <p className="text-2xl font-bold text-green-600">{balances.boundTokenBalance?.toFixed(8)}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Token Conversion */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Convert Tokens</h2>
          
          <form onSubmit={handleConversion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={conversion.amount}
                  onChange={(e) => setConversion({...conversion, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="fromType" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <select
                  value={conversion.fromType}
                  onChange={(e) => setConversion({...conversion, fromType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="internal">Internal Tokens</option>
                  <option value="bound">Bound Tokens</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="toType" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <select
                  value={conversion.toType}
                  onChange={(e) => setConversion({...conversion, toType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bound">Bound Tokens</option>
                  <option value="internal">Internal Tokens</option>
                </select>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={converting}
                className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {converting ? 'Converting...' : 'Convert Tokens'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Exchange internal tokens for bound tokens to prepare for withdrawal.</p>
            <p>Conversion rate: 1:1 (Internal to Bound)</p>
          </div>
        </div>
        
        {/* Economy Stats */}
        {economyStats && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Economy Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{economyStats.totalUsers}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Internal Tokens</p>
                <p className="text-xl font-bold text-blue-600">{economyStats.totalTokens?.toFixed(2)}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Bound Tokens</p>
                <p className="text-xl font-bold text-green-600">{economyStats.totalBoundTokens?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* How Economy Works */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How the Economy Works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Earn internal tokens through faucets, PTC, shortlinks, and mining</li>
            <li>Convert internal tokens to bound tokens for withdrawals</li>
            <li>Bound tokens can be withdrawn as cryptocurrency</li>
            <li>Internal tokens are for gameplay and earning</li>
            <li>Bound tokens are for withdrawals and transfers</li>
          </ul>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}