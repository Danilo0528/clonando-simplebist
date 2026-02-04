'use client';

import { FaCoins, FaBolt, FaUsers, FaChartLine, FaClock, FaGift } from 'react-icons/fa';

// Mock data for the dashboard
const stats = [
  { 
    label: 'Total Tokens', 
    value: '1,250.75',
    icon: <FaCoins className="text-yellow-400" />,
    change: '+5.2%',
    changeType: 'increase'
  },
  { 
    label: 'Hashrate', 
    value: '2,345 GH/s', 
    icon: <FaBolt className="text-red-400" />,
    change: '+2.1%',
    changeType: 'increase'
  },
  { 
    label: 'Referrals', 
    value: '86', 
    icon: <FaUsers className="text-blue-400" />,
    change: '+10',
    changeType: 'increase'
  },
  { 
    label: 'Daily Earnings', 
    value: '$12.45', 
    icon: <FaChartLine className="text-green-400" />,
    change: '-1.8%',
    changeType: 'decrease'
  },
];

const recentTransactions = [
  { id: 1, type: 'Faucet Claim', amount: '+5.25 Tokens', time: '2 mins ago', status: 'Completed' },
  { id: 2, type: 'PTC Ad View', amount: '+1.50 Tokens', time: '15 mins ago', status: 'Completed' },
  { id: 3, type: 'Shortlink Visit', amount: '+3.75 Tokens', time: '1 hour ago', status: 'Completed' },
  { id: 4, type: 'Withdrawal', amount: '-500.00 Tokens', time: '3 hours ago', status: 'Pending' },
  { id: 5, type: 'Offerwall Reward', amount: '+150.00 Tokens', time: '5 hours ago', status: 'Completed' },
];

const StatCard = ({ item }) => (
  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 transform transition-transform hover:scale-105 hover:bg-gray-800/80 shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gray-900/50 rounded-lg">{item.icon}</div>
        <div>
          <p className="text-sm text-gray-400">{item.label}</p>
          <p className="text-2xl font-bold text-white">{item.value}</p>
        </div>
      </div>
      <p className={`text-sm font-semibold ${
        item.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
      }`}>
        {item.change}
      </p>
    </div>
  </div>
);

const EarningsChart = () => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Earnings Overview</h3>
        <div className="h-60 flex items-center justify-center">
            {/* Placeholder for chart */}
            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                 <p className="text-gray-500">Chart coming soon</p>
            </div>
        </div>
    </div>
);

const RecentTransactions = () => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Amount</th>
                        <th scope="col" className="px-6 py-3">Time</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {recentTransactions.map(tx => (
                        <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{tx.type}</td>
                            <td className={`px-6 py-4 ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{tx.amount}</td>
                            <td className="px-6 py-4">{tx.time}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${tx.status === 'Completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DailyBonus = () => (
  <div className="bg-gradient-to-r from-cyan-500/80 to-blue-600/80 border border-cyan-400/50 rounded-xl p-8 shadow-2xl text-center relative overflow-hidden">
    <div className="absolute -top-4 -left-4 w-24 h-24 text-white/10">
        <FaGift size={96} />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">Daily Bonus</h3>
    <p className="text-blue-100 mb-4">Claim your daily reward and boost your earnings!</p>
    <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105">
      Claim Now
    </button>
    <div className="flex items-center justify-center mt-4 text-sm text-blue-200">
      <FaClock className="mr-2" />
      <span>Next claim in: 23:45:12</span>
    </div>
  </div>
);


export default function HomePage() {
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, Username!</h1>
        <p className="text-gray-400">Here is your account overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <StatCard key={index} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
              <EarningsChart />
              <RecentTransactions />
          </div>

          {/* Side Content Area */}
          <div className="space-y-8">
              <DailyBonus />
          </div>
      </div>

    </div>
  );
}