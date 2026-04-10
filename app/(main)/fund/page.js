'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaPlus, FaMinus, FaExchangeAlt, FaHistory, FaCopy, FaWallet } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function FundPage() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [balances, setBalances] = useState(null);
  const [depositAddress, setDepositAddress] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositType, setDepositType] = useState('token');
  const [transferFrom, setTransferFrom] = useState('main');
  const [transferTo, setTransferTo] = useState('token');
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const fetchFundData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/fund', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deposit info');
      }

      const data = await response.json();
      setDepositAddress(data.depositAddress);
      setBalances(data.balances);
    } catch (error) {
      console.error('Error fetching fund data:', error);
      setMessage('Error loading deposit info');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFundData();
  }, [fetchFundData]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      toast.success('Address copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      setMessage('Failed to copy address');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fund', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: depositAmount,
          type: depositType,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to process deposit');
      } else {
        setMessage(`✅ ${data.message}`);
        setBalances(data.newBalances);
        setDepositAmount('');
        await fetchFundData();
        toast.success('Deposit successful!');
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      setMessage('Error processing deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (transferFrom === transferTo) {
      setMessage('Source and destination must be different');
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Check if user has enough balance
      const balanceKey = transferFrom === 'main' ? 'main' : transferFrom === 'token' ? 'token' : 'bound';
      if (parseFloat(transferAmount) > balances[balanceKey]) {
        setMessage('Insufficient balance');
        setProcessing(false);
        return;
      }

      // Deduct from source
      const deductData = {};
      if (transferFrom === 'main') {
        deductData.balance = { decrement: parseFloat(transferAmount) };
      } else if (transferFrom === 'token') {
        deductData.tokenBalance = { decrement: parseFloat(transferAmount) };
      } else {
        deductData.boundTokenBalance = { decrement: parseFloat(transferAmount) };
      }

      // Add to destination
      const addData = {};
      if (transferTo === 'main') {
        addData.balance = { increment: parseFloat(transferAmount) };
      } else if (transferTo === 'token') {
        addData.tokenBalance = { increment: parseFloat(transferAmount) };
      } else {
        addData.boundTokenBalance = { increment: parseFloat(transferAmount) };
      }

      const response = await fetch('/api/economy/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: transferFrom,
          to: transferTo,
          amount: parseFloat(transferAmount),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to transfer');
      } else {
        setMessage(`✅ Transfer successful!`);
        setTransferAmount('');
        await fetchFundData();
        toast.success('Transfer completed!');
      }
    } catch (error) {
      console.error('Error transferring:', error);
      setMessage('Error processing transfer');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading fund data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaMoneyBillWave className="text-green-400" />
          Fund Account
        </h1>
        <p className="text-gray-400 mt-1">Add funds or transfer between balances</p>
      </div>

      {/* Balance Overview */}
      {balances && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Main Balance</p>
            <p className="text-2xl font-bold text-white">{balances.main?.toFixed(4)}</p>
          </div>
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Token Balance</p>
            <p className="text-2xl font-bold text-yellow-400">{balances.token?.toFixed(4)}</p>
          </div>
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Bound Tokens</p>
            <p className="text-2xl font-bold text-green-400">{balances.bound?.toFixed(4)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'deposit'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-[#2a2c3a] text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          <FaPlus /> Deposit
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'transfer'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-[#2a2c3a] text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          <FaExchangeAlt /> Transfer
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes('✅') || message.includes('success')
            ? 'bg-green-900/30 text-green-300 border border-green-700' 
            : 'bg-red-900/30 text-red-300 border border-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Content */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
        {activeTab === 'deposit' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Add Funds</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-medium mb-2">Simulated Deposit</h3>
                <p className="text-sm text-gray-400 mb-3">Add tokens to your account (for testing)</p>
                <form onSubmit={handleDeposit} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Balance Type</label>
                    <select
                      value={depositType}
                      onChange={(e) => setDepositType(e.target.value)}
                      className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                    >
                      <option value="token">Token Balance (SBT)</option>
                      <option value="main">Main Balance</option>
                      <option value="bound">Bound Token Balance</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded text-sm font-medium transition-colors"
                  >
                    {processing ? 'Processing...' : 'Deposit'}
                  </button>
                </form>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-medium mb-2">Your Deposit Address</h3>
                <p className="text-sm text-gray-400 mb-3">Use this address for crypto deposits</p>
                <div className="bg-black/30 rounded p-3 text-xs font-mono text-gray-300 break-all flex items-center justify-between gap-2">
                  <span>{depositAddress}</span>
                  <button 
                    onClick={handleCopyAddress}
                    className="flex-shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded transition-colors"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Transfer Between Balances</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">From</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                >
                  <option value="main">Main Balance ({balances?.main?.toFixed(4)})</option>
                  <option value="token">Token Balance ({balances?.token?.toFixed(4)})</option>
                  <option value="bound">Bound Token Balance ({balances?.bound?.toFixed(4)})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">To</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                >
                  <option value="token">Token Balance</option>
                  <option value="main">Main Balance</option>
                  <option value="bound">Bound Token Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={processing}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white py-2 rounded text-sm font-medium transition-colors"
              >
                {processing ? 'Processing...' : 'Transfer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
