'use client';

import { useState } from 'react';
import { FaMoneyBillWave, FaPlus, FaMinus, FaExchangeAlt, FaHistory } from 'react-icons/fa';

export default function FundPage() {
  const [activeTab, setActiveTab] = useState('deposit');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaMoneyBillWave className="text-green-400" />
          Fund Account
        </h1>
        <p className="text-gray-400 mt-1">Add funds or transfer between balances</p>
      </div>

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
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-[#2a2c3a] text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          <FaHistory /> History
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
        {activeTab === 'deposit' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Add Funds</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-medium mb-2">Cryptocurrency Deposit</h3>
                <p className="text-sm text-gray-400 mb-3">Send cryptocurrency to your wallet address</p>
                <div className="bg-black/30 rounded p-3 text-xs font-mono text-gray-300 break-all">
                  0x1234567890abcdef1234567890abcdef12345678
                </div>
                <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium transition-colors">
                  Copy Address
                </button>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-medium mb-2">Buy with Credit Card</h3>
                <p className="text-sm text-gray-400 mb-3">Purchase cryptocurrency with your credit card</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Transfer Between Balances</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">From</label>
                <select className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                  <option>Main Balance</option>
                  <option>Token Balance</option>
                  <option>Bound Token Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">To</label>
                <select className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                  <option>Token Balance</option>
                  <option>Main Balance</option>
                  <option>Bound Token Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded text-sm font-medium transition-colors">
                Transfer
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <FaPlus className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Deposit</p>
                    <p className="text-xs text-gray-500">2024-01-15 14:30</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">+100 SBT</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FaExchangeAlt className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Transfer</p>
                    <p className="text-xs text-gray-500">2024-01-14 10:15</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-medium">50 SBT</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
