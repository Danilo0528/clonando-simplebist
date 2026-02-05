'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaHome, FaChevronRight, FaCoins, FaServer, FaShoppingCart, FaMoneyBillWave, FaHistory } from 'react-icons/fa';

const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-400 mb-6 bg-gray-800/50 p-2 rounded-md">
      <FaHome className="mr-2" />
      <span>Dashboard</span>
      <FaChevronRight className="mx-2 text-xs" />
      <span className="text-white">Hardware</span>
    </div>
);

const HardwareStats = () => (
    <div className="bg-[#252736] rounded-lg p-5 mb-6 bg-cover bg-center" style={{backgroundImage: 'url("/images/hash-pattern.svg")'}}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            <div>
                <p className="text-gray-400">TOTAL HARDWARE</p>
                <p className="text-white font-semibold">0</p>
            </div>
            <div>
                <p className="text-gray-400">DAILY INCOME</p>
                <p className="flex items-center gap-1 text-white font-semibold"><FaCoins className="text-yellow-400"/> 0.00</p>
            </div>
            <div>
                <p className="text-gray-400">LAST CLAIM</p>
                <p className="text-white font-semibold">02/02/2026 01:57:09</p>
            </div>
            <div>
                <p className="text-gray-400">FUND HASHING POWER</p>
                <p className="text-white font-semibold">0</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-lg font-bold text-white">0.0000</span>
                <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md"><FaMoneyBillWave className="text-white"/></button>
            </div>
            <p className="text-xs text-gray-400">ACCUMULATED REWARD</p>
            <div className="flex-grow"></div>
            <div className="flex items-center gap-2">
                 <p className="text-gray-400 text-sm">Hardware rental log</p>
                <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm">View</button>
            </div>
        </div>
    </div>
);

const hardwareTiers = [
    {
        name: 'STARTER',
        image: '/images/starter-miner.png',
        monthlyProfit: '+6.00%',
        profitability: '+112%',
        duration: 60,
        price: 5000,
        profit: 5600,
        fundHash: 15,
    },
    {
        name: 'SUPERIOR',
        image: '/images/superior-miner.png',
        monthlyProfit: '+8.33%',
        profitability: '+125%',
        duration: 90,
        price: 5000,
        profit: 6250,
        fundHash: 20,
    },
    {
        name: 'ADVANCED',
        image: '/images/advanced-miner.png',
        monthlyProfit: '+8.75%',
        profitability: '+135%',
        duration: 120,
        price: 5000,
        profit: 6750,
        fundHash: 30,
    }
];

const HardwareCard = ({ tier }) => {
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
                    <div className="flex justify-between"><span>Duration</span> <span>{tier.duration} Days</span></div>
                    <div className="flex justify-between"><span>Price</span> <span className="flex items-center gap-1"><FaCoins className="text-yellow-400"/> {tier.price}</span></div>
                    <div className="flex justify-between"><span>Profit</span> <span className="flex items-center gap-1"><FaCoins className="text-yellow-400"/> {tier.profit}</span></div>
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
                <button className="w-full bg-transparent hover:bg-cyan-500 border-2 border-cyan-500 text-cyan-500 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                    Rent
                </button>
            </div>
        </div>
    );
};

export default function HardwarePage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Breadcrumb />
      <HardwareStats />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-yellow-400">High End Hardware</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {hardwareTiers.map(tier => (
            <HardwareCard key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
}
