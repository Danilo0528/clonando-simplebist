'use client';

import { FaHome, FaChevronRight, FaGift, FaPoll, FaMobileAlt, FaRocket, FaCheckCircle, FaHistory } from 'react-icons/fa';

// Placeholder data to match the new design
const offerwalls = [
  {
    id: 'timewall',
    name: 'Timewall',
    description: 'Complete tasks, surveys, and more. Wide variety of offers.',
    reward: 'Up to 10,000 tokens',
    icon: <FaPoll className="text-purple-400" />
  },
  {
    id: 'ayetstudios',
    name: 'Ayet-Studios',
    description: 'Explore new apps and games. Get rewarded for playing.',
    reward: 'Up to 5,000 tokens',
    icon: <FaMobileAlt className="text-green-400" />
  },
  {
    id: 'revlum',
    name: 'Revlum',
    description: 'High-paying surveys and exclusive app trials.',
    reward: 'Up to 15,000 tokens',
    icon: <FaRocket className="text-red-400" />
  },
];

const history = [
  {
    id: 1,
    provider: 'Timewall',
    offer: 'Complete a 10-minute survey',
    reward: 150,
    date: '2024-07-20'
  },
  {
    id: 2,
    provider: 'Ayet-Studios',
    offer: 'Reach level 5 in "Castle Clash"',
    reward: 300,
    date: '2024-07-19'
  },
  {
    id: 3,
    provider: 'Revlum',
    offer: 'Sign up for a free trial',
    reward: 500,
    date: '2024-07-19'
  },
];

const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-400 mb-6 bg-gray-800/50 p-2 rounded-md">
      <FaHome className="mr-2" />
      <span>Dashboard</span>
      <FaChevronRight className="mx-2 text-xs" />
      <span className="text-white">Offerwalls</span>
    </div>
);

const OfferwallCard = ({ offer }) => (
    <div className="bg-[#252736] rounded-xl p-6 flex flex-col hover:shadow-cyan-500/10 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-800/60 p-3 rounded-full text-2xl">
                {offer.icon}
            </div>
            <div>
                <h3 className="font-bold text-xl text-white">{offer.name}</h3>
                <p className="text-sm text-green-400 font-semibold">{offer.reward}</p>
            </div>
        </div>
        <p className="text-gray-400 text-sm mb-5 flex-grow">{offer.description}</p>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors duration-200 w-full">
            Visit {offer.name}
        </button>
    </div>
);

const HistoryTable = ({ history }) => (
  <div className="bg-[#252736] rounded-xl p-6">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FaHistory /> Recent Completions</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full ">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Offer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reward</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {history.map((record) => (
            <tr key={record.id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{record.provider}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{record.offer}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-green-400 font-bold">+{record.reward}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function OfferwallsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
        <Breadcrumb />
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Available Offerwalls</h1>
            <p className="text-gray-400">Choose a provider to start earning tokens by completing offers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {offerwalls.map((offer) => (
                <OfferwallCard key={offer.id} offer={offer} />
            ))}
        </div>

        <HistoryTable history={history} />
    </div>
  );
}
