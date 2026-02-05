'use client';

import { FaUsers, FaClock, FaBolt, FaCalculator, FaCoins } from 'react-icons/fa';

const COINS = [
    { id: 'bitcoin', name: 'Bitcoin', block: '#19111', reward: '5,968.98', algorithm: 'SHA256', power: '36.55 GH', participants: '300', time: '03:03:02', iconColor: 'bg-orange-500' },
    { id: 'ethereum', name: 'Ethereum', block: '#19112', reward: '5,934.79', algorithm: 'Ethash', power: '46.47 GH', participants: '227', time: '03:03:02', iconColor: 'bg-blue-500' },
    { id: 'litecoin', name: 'Litecoin', block: '#19113', reward: '5,955.54', algorithm: 'Scrypt', power: '20.32 GH', participants: '289', time: '03:03:02', iconColor: 'bg-gray-500' },
];

export default function MiningCompact({ onSelectCoin }) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-200">Available Mining Blocks</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COINS.map((coin) => (
                    <div key={coin.id} className="bg-[#252736] rounded-lg p-6 flex flex-col justify-between cursor-pointer" onClick={() => onSelectCoin(coin)}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`${coin.iconColor} p-2 rounded-full`}>
                                        <FaCoins className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-white">{coin.name}</h3>
                                        <p className="text-sm text-gray-400">{coin.block}</p>
                                    </div>
                                </div>
                                <p className="flex items-center justify-center gap-1 text-lg font-semibold text-yellow-400">
                                    <span className="text-xs">&#9679;</span> {coin.reward}
                                </p>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 flex items-center gap-2"><FaCalculator /> Algorithm</span>
                                    <span className="text-white font-semibold">{coin.algorithm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 flex items-center gap-2"><FaBolt /> Total Power</span>
                                    <span className="text-white font-semibold">{coin.power}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 flex items-center gap-2"><FaUsers /> Participants</span>
                                    <span className="text-white font-semibold">{coin.participants}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 flex items-center gap-2"><FaClock /> Time Left</span>
                                    <span className="text-white font-semibold">{coin.time}</span>
                                </div>
                            </div>
                        </div>
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-md text-base mt-6 w-full transition-colors duration-200">
                            Join Block
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
