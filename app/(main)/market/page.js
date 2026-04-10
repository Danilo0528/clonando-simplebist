'use client';

import { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaFilter, FaCoins, FaTag, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MarketPage() {
  const [marketItems, setMarketItems] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  // Cargar datos del mercado y balance del usuario
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar items del mercado
      const marketRes = await axios.get('/api/market');
      setMarketItems(marketRes.data.items || []);

      // Cargar balance del usuario
      const userRes = await axios.get('/api/user');
      setUserBalance(userRes.data.tokenBalance || 0);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (!confirm(`Are you sure you want to buy "${item.name}" for ${item.price} SBT?`)) {
      return;
    }

    try {
      setPurchasing(item.id);
      
      const response = await axios.post('/api/market', {
        itemId: item.id,
        quantity: 1,
      });

      toast.success(response.data.message);
      
      // Recargar datos
      await loadData();
    } catch (error) {
      console.error('Purchase error:', error);
      const message = error.response?.data?.message || 'Purchase failed';
      toast.error(message);
    } finally {
      setPurchasing(null);
    }
  };

  const categories = ['all', 'hardware', 'consumable', 'booster'];

  const filteredItems = marketItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemIcon = (type) => {
    switch(type) {
      case 'hardware': return '⛏️';
      case 'consumable': return '⚡';
      case 'booster': return '🚀';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading market...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaShoppingCart className="text-purple-400" />
              Market
            </h1>
            <p className="text-gray-400 mt-1">Buy mining hardware and items</p>
          </div>
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <FaCoins className="text-yellow-400" />
              <span className="text-white font-semibold">{userBalance.toFixed(2)} SBT</span>
            </div>
          </div>
        </div>
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
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#2a2c3a] border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all"
            >
              <div className="h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                <span className="text-6xl">{getItemIcon(item.type)}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description || 'No description'}</p>

                <div className="space-y-2 text-sm">
                  {item.hashrate > 0 && (
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="text-gray-500">Hashrate:</span>
                      <span className="text-green-400">{item.hashrate} MH/s</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-500">Type:</span>
                    <span className="capitalize text-blue-400">{item.type}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCoins className="text-yellow-400" />
                    <span className="text-white font-semibold">{item.price} SBT</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id || userBalance < item.price}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      purchasing === item.id
                        ? 'bg-gray-600 cursor-not-allowed'
                        : userBalance < item.price
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {purchasing === item.id ? 'Buying...' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#2a2c3a] rounded-lg">
          <FaBoxOpen className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No items found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
