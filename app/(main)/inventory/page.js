'use client';

import { useState, useEffect } from 'react';
import { FaBox, FaMicrochip, FaHammer, FaBolt, FaCoins } from 'react-icons/fa';

const mockInventory = [
  { id: 1, name: 'Basic Miner', type: 'hardware', icon: FaMicrochip, quantity: 1, hashpower: '10 MH/s', status: 'active' },
  { id: 2, name: 'Energy Booster', type: 'consumable', icon: FaBolt, quantity: 5, effect: '+50 Energy', status: 'usable' },
  { id: 3, name: 'Mining Rig MK1', type: 'hardware', icon: FaHammer, quantity: 1, hashpower: '50 MH/s', status: 'active' },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load inventory from API or localStorage
    const loadInventory = async () => {
      try {
        // TODO: Replace with real API call
        setInventory(mockInventory);
      } catch (error) {
        console.error('Error loading inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const filteredInventory = filter === 'all' 
    ? inventory 
    : inventory.filter(item => item.type === filter);

  const itemTypes = ['all', 'hardware', 'consumable'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaBox className="text-blue-400" />
          Inventory
        </h1>
        <p className="text-gray-400 mt-1">Manage your items and equipment</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {itemTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-[#2a2c3a] text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <Icon className="text-2xl text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    {item.hashpower && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaMicrochip className="text-xs text-gray-500" />
                        <span>{item.hashpower}</span>
                      </div>
                    )}
                    {item.effect && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaBolt className="text-xs text-yellow-500" />
                        <span>{item.effect}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaCoins className="text-xs text-yellow-500" />
                      <span>Quantity: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'usable' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12 bg-[#2a2c3a] rounded-lg">
          <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Your inventory is empty</p>
          <p className="text-sm text-gray-500 mt-2">Complete tasks or purchase items to fill it up</p>
        </div>
      )}
    </div>
  );
}
