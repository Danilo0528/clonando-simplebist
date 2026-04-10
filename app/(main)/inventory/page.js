'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaBox, FaMicrochip, FaBolt, FaCoins, FaHammer, FaShieldAlt, FaStar } from 'react-icons/fa';

const iconMap = {
    hardware: FaMicrochip,
    consumable: FaBolt,
    booster: FaStar,
};

const statusLabels = {
    active: 'Active',
    usable: 'Usable',
    expired: 'Expired',
};

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const router = useRouter();

    const fetchInventory = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('/api/market?view=inventory', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }

            const data = await response.json();
            setInventory(data.inventory || []);
        } catch (error) {
            console.error('Error loading inventory:', error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const filteredInventory = filter === 'all'
        ? inventory
        : inventory.filter(item => item.itemType === filter);

    const itemTypes = ['all', 'hardware', 'consumable', 'booster'];

    const getItemIcon = (itemType) => {
        const Icon = iconMap[itemType] || FaBox;
        return Icon;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-white">Loading inventory...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
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
            {filteredInventory.length === 0 ? (
                <div className="text-center py-16 bg-[#2a2c3a] rounded-lg">
                    <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Your inventory is empty</p>
                    <p className="text-sm text-gray-500 mt-2">Visit the market to purchase items</p>
                    <button 
                        onClick={() => router.push('/market')}
                        className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md transition-colors"
                    >
                        Go to Market
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInventory.map((item) => {
                        const Icon = getItemIcon(item.itemType);
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
                                        <h3 className="font-semibold text-white">{item.itemName}</h3>
                                        <p className="text-xs text-gray-400 capitalize">{item.itemType}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            {item.hashrate > 0 && (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <FaMicrochip className="text-xs text-gray-500" />
                                                    <span>{item.hashrate} MH/s</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <FaCoins className="text-xs text-yellow-500" />
                                                <span>Quantity: {item.quantity}</span>
                                            </div>
                                            {item.expiresAt && (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <FaBolt className="text-xs text-yellow-500" />
                                                    <span>Expires: {new Date(item.expiresAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                item.status === 'active' || item.status === 'usable'
                                                    ? 'bg-green-500/20 text-green-400' :
                                                    item.status === 'expired'
                                                    ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-700 text-gray-400'
                                            }`}>
                                                {statusLabels[item.status] || item.status || 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-gray-500">
                                    Purchased: {new Date(item.purchasedAt).toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
