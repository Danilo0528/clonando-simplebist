'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SimpleMiner from '../../../components/SimpleMiner';
import TopBar from '../../../components/TopBar';
import { FaUsers, FaClock, FaBolt, FaCalculator, FaCoins } from 'react-icons/fa';
import BlockLog from '../../../components/BlockLog';

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
            <p className="mt-4 text-gray-400">Loading mining page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TopBar />
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <h3 className="text-4xl font-bold text-white">113</h3>
            <p className="text-gray-400">BLOCKS YOU PARTICIPATED IN</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <h3 className="text-4xl font-bold text-white">315.33 MH</h3>
            <p className="text-gray-400">HASHING GENERATED</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <h3 className="text-4xl font-bold text-white">102.92</h3>
            <p className="text-gray-400">TOTAL REWARD</p>
          </div>
          <BlockLog />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-200">Available Mining Blocks</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bitcoin Block Card */}
          <div className="bg-[#252736] rounded-lg p-6 flex flex-col justify-between cursor-pointer"
               onClick={() => router.push('/mining/bitcoin')}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-full">
                    <FaCoins className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Bitcoin</h3>
                    <p className="text-sm text-gray-400">Block #19111</p>
                  </div>
                </div>
                <p className="flex items-center justify-center gap-1 text-lg font-semibold text-yellow-400">
                  <span className="text-xs">&#9679;</span> 5,968.98
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaCalculator /> Algorithm</span>
                  <span className="text-white font-semibold">SHA256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaBolt /> Total Power</span>
                  <span className="text-white font-semibold">36.55 GH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaUsers /> Participants</span>
                  <span className="text-white font-semibold">300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaClock /> Time Left</span>
                  <span className="text-white font-semibold">03:03:02</span>
                </div>
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-md text-base mt-6 w-full transition-colors duration-200">
              Join Block
            </button>
          </div>

          {/* Ethereum Block Card */}
          <div className="bg-[#252736] rounded-lg p-6 flex flex-col justify-between cursor-pointer"
               onClick={() => router.push('/mining/ethereum')}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <FaCoins className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Ethereum</h3>
                    <p className="text-sm text-gray-400">Block #19112</p>
                  </div>
                </div>
                <p className="flex items-center justify-center gap-1 text-lg font-semibold text-yellow-400">
                  <span className="text-xs">&#9679;</span> 5,934.79
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaCalculator /> Algorithm</span>
                  <span className="text-white font-semibold">Ethash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaBolt /> Total Power</span>
                  <span className="text-white font-semibold">46.47 GH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaUsers /> Participants</span>
                  <span className="text-white font-semibold">227</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaClock /> Time Left</span>
                  <span className="text-white font-semibold">03:03:02</span>
                </div>
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-md text-base mt-6 w-full transition-colors duration-200">
              Join Block
            </button>
          </div>

          {/* Litecoin Block Card */}
          <div className="bg-[#252736] rounded-lg p-6 flex flex-col justify-between cursor-pointer"
               onClick={() => router.push('/mining/litecoin')}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-500 p-2 rounded-full">
                    <FaCoins className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Litecoin</h3>
                    <p className="text-sm text-gray-400">Block #19113</p>
                  </div>
                </div>
                <p className="flex items-center justify-center gap-1 text-lg font-semibold text-yellow-400">
                  <span className="text-xs">&#9679;</span> 5,955.54
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaCalculator /> Algorithm</span>
                  <span className="text-white font-semibold">Scrypt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaBolt /> Total Power</span>
                  <span className="text-white font-semibold">20.32 GH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaUsers /> Participants</span>
                  <span className="text-white font-semibold">289</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-2"><FaClock /> Time Left</span>
                  <span className="text-white font-semibold">03:03:02</span>
                </div>
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-md text-base mt-6 w-full transition-colors duration-200">
              Join Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
