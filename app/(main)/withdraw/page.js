'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStats } from '../../../context/StatsContext';

export default function WithdrawPage() {
  const [balances, setBalances] = useState(null);
  const [withdrawal, setWithdrawal] = useState({ amount: '', crypto: 'BTC', address: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState(null);
  const router = useRouter();
  const { refreshUserData } = useStats(); // Import refresh function from context

  const fetchBalances = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
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
  }, [router]);

  const fetchWithdrawalData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/withdrawal/request', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal data');
      }

      const data = await response.json();
      setHistory(data.history);
      setConfig(data.config);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      setMessage('Error loading withdrawal data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBalances();
    fetchWithdrawalData();
  }, [fetchBalances, fetchWithdrawalData]);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!withdrawal.amount || parseFloat(withdrawal.amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (!withdrawal.address) {
      setMessage('Please enter a valid address');
      return;
    }

    if (parseFloat(withdrawal.amount) > balances?.boundTokenBalance) {
      setMessage('Insufficient bound token balance');
      return;
    }

    if (config && config.minAmounts && parseFloat(withdrawal.amount) < config.minAmounts[withdrawal.crypto]) {
      setMessage(`Minimum withdrawal amount for ${withdrawal.crypto} is ${config.minAmounts[withdrawal.crypto]}`);
      return;
    }

    setRequesting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawal.amount),
          crypto: withdrawal.crypto,
          address: withdrawal.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to create withdrawal request');
        return;
      }

      setMessage('Withdrawal request created successfully!');
      setWithdrawal({ amount: '', crypto: 'BTC', address: '' });
      fetchBalances(); // Refresh balances
      fetchWithdrawalData(); // Refresh history
      
      // Refresh user data to ensure all components have updated information
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      setMessage('Error creating withdrawal request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading withdrawal system...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Withdrawal</h1>
        
        {/* Bound Token Balance */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available for Withdrawal</h2>
          
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Bound Token Balance</p>
            <p className="text-3xl font-bold text-green-600">{balances?.boundTokenBalance != null ? (typeof window !== 'undefined' ? balances.boundTokenBalance.toFixed(8) : balances.boundTokenBalance.toString()) : ''}</p>
          </div>
        </div>
        
        {/* Withdrawal Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Withdrawal</h2>
          
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={withdrawal.amount}
                  onChange={(e) => setWithdrawal({...withdrawal, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount to withdraw"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="crypto" className="block text-sm font-medium text-gray-700 mb-1">
                  Cryptocurrency
                </label>
                <select
                  value={withdrawal.crypto}
                  onChange={(e) => setWithdrawal({...withdrawal, crypto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {config?.supportedCryptos.map((crypto) => (
                    <option key={crypto} value={crypto}>{crypto}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={withdrawal.address}
                onChange={(e) => setWithdrawal({...withdrawal, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your wallet address"
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={requesting}
                className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {requesting ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          </form>
          
          {config && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Supported cryptocurrencies: {config.supportedCryptos.join(', ')}</p>
              <p>Minimum withdrawal amounts:</p>
              <ul className="list-disc pl-5 mt-1">
                {Object.entries(config.minAmounts).map(([crypto, amount]) => (
                  <li key={crypto}>{crypto}: {amount}</li>
                ))}
              </ul>
              <p className="mt-2">Fee: {(config.fees.BTC * 100)}% of withdrawal amount</p>
            </div>
          )}
        </div>
        
        {/* Withdrawal History */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Withdrawals</h2>
          
          {history.length === 0 ? (
            <p className="text-gray-600">No withdrawal history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.cryptoCurrency}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {record.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Withdrawal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Withdrawal Information</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Only bound tokens can be withdrawn</li>
            <li>A fee of 2% applies to all withdrawals</li>
            <li>Withdrawal requests are processed manually</li>
            <li>Minimum withdrawal amounts apply per cryptocurrency</li>
            <li>Make sure to enter a valid wallet address</li>
            <li>Withdrawal status will update once processed</li>
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