'use client';

import { FaHome, FaChevronRight, FaCoins, FaStar, FaClock, FaWindowMaximize, FaMobileAlt, FaNewspaper } from 'react-icons/fa';

const ptcAds = [
  {
    title: 'Win up to 5 BTC!',
    description: 'Total of 840% Deposit Bonus, flashdrops, rakeback, and much more! JOIN NOW!',
    tokens: 8.25,
    exp: 28,
    duration: 15,
    icons: ['desktop', 'mobile']
  },
  {
    title: 'Free Spin up to 5BTC now!',
    description: 'Flashdrops, Rakebacks & much more!',
    tokens: 13.75,
    exp: 88,
    duration: 60,
    icons: ['desktop', 'mobile']
  },
  {
    title: 'WIN up to 5 BTC',
    description: 'Total of 840% Deposit Bonus, flashdrops, rakeback, and much more! JOIN NOW!',
    tokens: 8.25,
    exp: 28,
    duration: 15,
    icons: ['desktop', 'mobile']
  }
];

const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-400 mb-4 bg-gray-800/50 p-2 rounded-md">
      <FaHome className="mr-2" />
      <span>Dashboard</span>
      <FaChevronRight className="mx-2 text-xs" />
      <span className="text-white">Mining (Test)</span>
    </div>
);

const StatsBar = () => (
    <div className="bg-[#252736] rounded-lg p-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400">Available PTC</p>
                    <p className="text-lg font-bold text-white">7</p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400">Total Tokens</p>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                        <FaCoins className="text-yellow-400" /> 68.75
                    </p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400">Total Exp</p>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                        <FaStar className="text-blue-400" /> 260
                    </p>
                </div>
            </div>
            <button className="border-2 border-gray-600 hover:bg-gray-700/50 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">
                Create PTC Ads
            </button>
        </div>
    </div>
);

const PTCAdCard = ({ ad }) => (
    <div className="bg-[#252736] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between mb-3 gap-4">
        <div className="flex-grow">
            <h3 className="font-bold text-lg text-white flex items-center gap-2"> <FaNewspaper className='text-green-400'/> {ad.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{ad.description}</p>
            <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full"><FaStar /> {ad.exp} Exp</span>
                <span className="flex items-center gap-1 bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full"><FaClock /> {ad.duration} Seconds</span>
                <span className="flex items-center gap-1 bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full"><FaWindowMaximize /></span>
                <span className="flex items-center gap-1 bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full"><FaMobileAlt /></span>
            </div>
        </div>
        <div className="flex-shrink-0 text-center md:text-right">
            <p className="flex items-center justify-center gap-1 text-sm font-semibold text-yellow-400">
                <span className="text-xs">&#9679;</span> {ad.tokens}
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-md text-sm mt-1 transition-colors duration-200">VIEW</button>
        </div>
    </div>
);

export default function MiningCoinPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
        <Breadcrumb />
        <StatsBar />
        <div>
            {ptcAds.map((ad, index) => (
                <PTCAdCard key={index} ad={ad} />
            ))}
        </div>
    </div>
  );
}
