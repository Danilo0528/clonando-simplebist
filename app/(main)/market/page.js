'use client';

import { useState } from 'react';
import { FaShoppingCart, FaSearch, FaFilter, FaCoins, FaTag } from 'react-icons/fa';

const mockMarketItems = [
  { id: 1, name: 'Advanced Miner MK2', seller: 'CryptoMiner', price: 500, hashpower: '100 MH/s', type: 'hardware', image: '⛏️' },
  { id: 2, name: 'Energy Boost Pack', seller: 'PowerUser', price: 50, energy: '+500', type: 'consumable', image: '⚡' },
  { id: 3, name: 'Premium Mining Rig', seller: 'HashMaster', price: 1200, hashpower: '500 MH/s', type: 'hardware', image: '🔧' },
  { id: 4, name: 'XP Booster', seller: 'LevelUp', price: 100, xp: '2x for 24h', type: 'booster', image: '🚀' },
];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'hardware', 'consumable', 'booster'];

  const filteredItems = mockMarketItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaShoppingCart className="text-purple-400" />
          Market
        </h1>
        <p className="text-gray-400 mt-1">Buy and sell items with other users</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search market items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e202b] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#2a2c3a] border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all cursor-pointer"
          >
            <div className="h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
              <span className="text-6xl">{item.image}</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-1">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-3">by {item.seller}</p>
              
              <div className="space-y-2 text-sm">
                {item.hashpower && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Hashpower:</span>
                    <span>{item.hashpower}</span>
                  </div>
                )}
                {item.energy && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Energy:</span>
                    <span className="text-yellow-400">{item.energy}</span>
                  </div>
                )}
                {item.xp && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Effect:</span>
                    <span className="text-blue-400">{item.xp}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCoins className="text-yellow-400" />
                  <span className="text-white font-semibold">{item.price} SBT</span>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-[#2a2c3a] rounded-lg">
          <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No items found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
