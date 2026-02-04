'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '../../../components/TopBar';
import { FaBitcoin, FaEthereum, FaArchive, FaBolt, FaUsers, FaClock, FaCalculator, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { SiLitecoin } from 'react-icons/si';

// This data would typically come from an API
const miningBlocks = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    block: '#9382',
    reward: 7096.96,
    algorithm: 'SHA256',
    totalPower: '56.51 GH',
    participants: 334,
    timeLeft: '01:14:34',
    icon: <FaBitcoin className="text-yellow-500" />,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    block: '#9383',
    reward: 7186.95,
    algorithm: 'Ethash',
    totalPower: '41.02 GH',
    participants: 255,
    timeLeft: '01:14:34',
    icon: <FaEthereum className="text-blue-500" />,
  },
  {
    id: 'litecoin',
    name: 'Litecoin',
    block: '#9384',
    reward: 7115.42,
    algorithm: 'Scrypt',
    totalPower: '24.56 GH',
    participants: 330,
    timeLeft: '01:14:34',
    icon: <SiLitecoin className="text-gray-400" />,
  },
];

export default function MiningPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="flex-grow flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading mining pools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TopBar />
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FaArchive className="text-blue-400 mr-2" /> Mining
            </h1>
            <p className="text-gray-400">Participate in mining pools and earn rewards</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Dashboard</span>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-blue-400">Mining</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 border border-blue-500 shadow-lg">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <FaArchive className="text-white text-xl" />
              </div>
              <div>
                <p className="text-blue-200 text-sm">Blocks Participated</p>
                <p className="text-white font-bold text-xl">112</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 border border-green-500 shadow-lg">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <FaBolt className="text-white text-xl" />
              </div>
              <div>
                <p className="text-green-200 text-sm">Hashing Generated</p>
                <p className="text-white font-bold text-xl">313.98 MH</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 border border-purple-500 shadow-lg">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Total Reward</p>
                <p className="text-white font-bold text-xl">182.92</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl p-5 border border-yellow-500 shadow-lg flex flex-col items-center justify-center">
            <p className="text-yellow-200 text-sm mb-1">Your Block Log</p>
            <button className="bg-white text-yellow-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
              View
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaArchive className="text-green-400 mr-2" /> Available Mining Pools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {miningBlocks.map((block) => (
              <div key={block.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 border border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{block.icon}</div>
                    <div>
                      <h3 className="font-bold text-xl text-white">{block.name}</h3>
                      <p className="text-sm text-gray-400">Block {block.block}</p>
                    </div>
                  </div>
                  <p className="font-bold text-xl text-yellow-400">{block.reward}</p>
                </div>

                <div className="border-t border-gray-600 my-4"></div>

                <div className="space-y-3 text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center">
                      <FaCalculator className="mr-2 text-xs" /> Algorithm
                    </span>
                    <span className="text-white">{block.algorithm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center">
                      <FaBolt className="mr-2 text-xs" /> Total Power
                    </span>
                    <span className="text-white">{block.totalPower}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center">
                      <FaUsers className="mr-2 text-xs" /> Participants
                    </span>
                    <span className="text-white">{block.participants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center">
                      <FaClock className="mr-2 text-xs" /> Time Left
                    </span>
                    <span className="text-white">{block.timeLeft}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href={`/mining/${block.id}`} passHref>
                    <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                      Join Block
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 mt-6 border border-gray-700 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaInfoCircle className="text-blue-400 mr-2" /> Mining Tips
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Join blocks with fewer participants for better rewards</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Higher level gives you better mining bonuses</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Check back regularly for new mining opportunities</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Invest in hardware to increase your hash power</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
