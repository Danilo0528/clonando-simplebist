'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHome, FaChevronRight, FaCoins, FaServer, FaShoppingCart, FaMoneyBillWave, FaHistory, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useStats } from '../../../context/StatsContext';

const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-400 mb-6 bg-gray-800/50 p-2 rounded-md">
      <FaHome className="mr-2" />
      <span>Dashboard</span>
      <FaChevronRight className="mx-2 text-xs" />
      <span className="text-white">Hardware</span>
    </div>
);

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const HardwareStats = ({ stats, claiming, onClaim }) => (
    <div className="bg-[#252736] rounded-lg p-5 mb-6 bg-cover bg-center" style={{backgroundImage: 'url("/images/hash-pattern.svg")'}}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            <div>
                <p className="text-gray-400">TOTAL HARDWARE</p>
                <p className="text-white font-semibold">{stats.totalHardware}</p>
            </div>
            <div>
                <p className="text-gray-400">DAILY INCOME</p>
                <p className="flex items-center gap-1 text-white font-semibold"><FaCoins className="text-yellow-400"/> {stats.dailyIncome.toFixed(4)}</p>
            </div>
            <div>
                <p className="text-gray-400">LAST CLAIM</p>
                <p className="text-white font-semibold">{formatDate(stats.lastClaim)}</p>
            </div>
            <div>
                <p className="text-gray-400">FUND HASHING POWER</p>
                <p className="text-white font-semibold">{stats.totalHash}</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-lg font-bold text-white">{stats.accrued.toFixed(4)}</span>
                <button
                    onClick={onClaim}
                    disabled={claiming || stats.accrued <= 0}
                    className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {claiming ? <FaSpinner className="animate-spin text-white"/> : <FaMoneyBillWave className="text-white"/>}
                </button>
            </div>
            <p className="text-xs text-gray-400">ACCUMULATED REWARD (claim → bound)</p>
            <div className="flex-grow"></div>
        </div>
    </div>
);

const HardwareLog = ({ rentals }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Hardware rental log</p>
                <button onClick={() => setOpen(!open)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                    {open ? 'Hide' : 'View'}
                </button>
            </div>
            {open && (
                <div className="mt-3 bg-[#252736] rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800/60 text-gray-400">
                            <tr>
                                <th className="p-3">Plan</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Duration</th>
                                <th className="p-3">Start</th>
                                <th className="p-3">End</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {rentals.length === 0 && (
                                <tr><td colSpan="6" className="p-3 text-center text-gray-500">No rentals yet</td></tr>
                            )}
                            {rentals.map(r => (
                                <tr key={r.id} className="border-t border-gray-700/50">
                                    <td className="p-3 font-semibold text-white">Plan #{r.marketItemId}</td>
                                    <td className="p-3">{r.amountPaid} SBT</td>
                                    <td className="p-3">{r.durationDays} days</td>
                                    <td className="p-3">{formatDate(r.startTime)}</td>
                                    <td className="p-3">{formatDate(r.endTime)}</td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-xs ${r.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                        {r.status}
                                      </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const HardwareCard = ({ tier, onRent, renting }) => {
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="bg-[#252736] rounded-lg p-5 flex flex-col justify-between">
            <div>
                <Image src={tier.image} alt={`${tier.name} miner`} width={96} height={96} className="mx-auto mb-4"/>
                <h3 className="text-xl font-bold text-center text-white">{tier.name}</h3>
                <p className="text-sm text-gray-400 text-center mb-2">HARDWARE</p>
                <p className="text-4xl font-bold text-center text-green-400 mb-1">{tier.profitability}</p>
                <p className="text-sm text-gray-400 text-center mb-5">{tier.monthlyProfit} Monthly profit</p>
                
                <div className="text-sm space-y-2 text-gray-300">
                    <div className="flex justify-between"><span>Duration</span> <span>{tier.durationDays} Days</span></div>
                    <div className="flex justify-between"><span>Price</span> <span className="flex items-center gap-1"><FaCoins className="text-yellow-400"/> {tier.price}</span></div>
                    <div className="flex justify-between"><span>Profit</span> <span className="flex items-center gap-1"><FaCoins className="text-green-400"/> {tier.profit}</span></div>
                    <div className="flex justify-between"><span>Fund Hash</span> <span>{tier.fundHash} Hash</span></div>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex gap-1">
                        <button onClick={() => setQuantity(1)} className={`px-3 py-1 text-xs rounded ${quantity === 1 ? 'bg-cyan-500 text-white' : 'bg-gray-700'}`}>x1</button>
                        <button onClick={() => setQuantity(5)} className={`px-3 py-1 text-xs rounded ${quantity === 5 ? 'bg-cyan-500 text-white' : 'bg-gray-700'}`}>x5</button>
                        <button onClick={() => setQuantity(10)} className={`px-3 py-1 text-xs rounded ${quantity === 10 ? 'bg-cyan-500 text-white' : 'bg-gray-700'}`}>x10</button>
                    </div>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                        className="w-20 bg-gray-900 border border-gray-700 rounded-md p-1 text-center"
                    />
                </div>
                <button
                    onClick={() => onRent(tier, quantity)}
                    disabled={renting}
                    className="w-full bg-transparent hover:bg-cyan-500 border-2 border-cyan-500 text-cyan-500 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {renting ? <FaSpinner className="animate-spin inline mr-2"/> : <FaShoppingCart className="inline mr-2"/>}
                    Rent {quantity > 1 ? `x${quantity}` : ''} — {(tier.price * quantity).toLocaleString()} SBT
                </button>
            </div>
        </div>
    );
};

const DEFAULT_STATS = {
    totalHardware: 0,
    totalContracts: 0,
    dailyIncome: 0,
    totalHash: 0,
    accrued: 0,
    lastClaim: null,
};

export default function HardwarePage() {
    const router = useRouter();
    const { userData, refreshUserData } = useStats();
    const [plans, setPlans] = useState([]);
    const [stats, setStats] = useState(DEFAULT_STATS);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [renting, setRenting] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const fetchHardware = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const res = await fetch('/api/hardware', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch hardware data');
            }

            const data = await res.json();
            setPlans(data.plans || []);
            setStats(data.stats || DEFAULT_STATS);
            setRentals(data.activeRentals || []);
        } catch (error) {
            console.error('Error fetching hardware:', error);
            toast.error('Error loading hardware data');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchHardware();
    }, [fetchHardware]);

    const handleRent = async (tier, quantity) => {
        setRenting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hardware', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'rent', plan: tier.name, quantity }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to rent hardware');
            }

            toast.success(data.message);
            await fetchHardware();
            if (refreshUserData) await refreshUserData();
        } catch (error) {
            console.error('Error renting hardware:', error);
            toast.error(error.message || 'Error renting hardware');
        } finally {
            setRenting(false);
        }
    };

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hardware', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'claim' }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to claim reward');
            }

            toast.success(data.message);
            await fetchHardware();
            if (refreshUserData) await refreshUserData();
        } catch (error) {
            console.error('Error claiming hardware reward:', error);
            toast.error(error.message || 'Error claiming reward');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return <div className="w-full max-w-7xl mx-auto text-center text-white py-20">Loading hardware...</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <Breadcrumb />
            <HardwareStats stats={stats} claiming={claiming} onClaim={handleClaim} />
            <HardwareLog rentals={rentals} />
            <div className="mb-6">
                <h2 className="text-xl font-bold text-yellow-400">High End Hardware</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map(tier => (
                    <HardwareCard key={tier.name} tier={tier} onRent={handleRent} renting={renting} />
                ))}
            </div>
        </div>
    );
}