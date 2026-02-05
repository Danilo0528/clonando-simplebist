'use client';

import { FaUsers, FaClock, FaBolt, FaServer, FaChartLine, FaQuestionCircle, FaCoins } from 'react-icons/fa';

export default function BitcoinPoolInfo({ coin, onBack }) {
    if (!coin) return null;

    const yourPower = "1.52 MH";
    const estimatedReward = "0.273";

    return (
        <div className="bg-[#2a2d3d] rounded-lg p-6 w-full max-w-4xl mx-auto mb-8 text-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <div className={`${coin.iconColor} p-3 rounded-full`}>
                        <FaCoins className="text-white text-3xl" />
                    </div>
                    <div>
                        <h2 className="font-bold text-2xl">{coin.name} Pool</h2>
                        <p className="text-sm text-gray-400">Block {coin.block}</p>
                    </div>
                </div>
                <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Back
                </button>
            </div>

            <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">POOL REWARD</p>
                <p className="text-4xl font-bold text-yellow-400">{coin.reward}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <FaUsers className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold">{coin.participants}</p>
                    <p className="text-xs text-gray-500">Miners</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <FaBolt className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold">{coin.power}</p>
                    <p className="text-xs text-gray-500">Total Power</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <FaClock className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold">{coin.time}</p>
                    <p className="text-xs text-gray-500">Time Left</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <FaServer className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold">{coin.algorithm}</p>
                    <p className="text-xs text-gray-500">Algorithm</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <FaChartLine className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold">{yourPower}</p>
                    <p className="text-xs text-gray-500">Your Power</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <FaQuestionCircle className="mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold">{estimatedReward}</p>
                    <p className="text-xs text-gray-500">Estimated Reward</p>
                </div>
            </div>
        </div>
    );
}
