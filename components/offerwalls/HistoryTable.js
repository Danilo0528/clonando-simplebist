'use client';

import { 
    FaHistory, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaCalendarAlt, FaCoins 
} from 'react-icons/fa';

const statusInfo = {
    Completed: { icon: <FaCheckCircle className="text-green-500" />, color: 'text-green-400', bg: 'bg-green-500/10' },
    Pending: { icon: <FaHourglassHalf className="text-yellow-500" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    Reversed: { icon: <FaTimesCircle className="text-red-500" />, color: 'text-red-400', bg: 'bg-red-500/10' },
};

const HistoryTable = ({ history }) => (
  <div className="bg-gray-800/60 rounded-xl p-6 shadow-lg">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><FaHistory /> Recent Completions</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Offer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reward</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {history.map((record) => {
            const status = statusInfo[record.status] || statusInfo.Pending;
            return (
                <tr key={record.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap font-medium text-white flex items-center gap-3">
                    <img src={record.provider_logo} alt={record.provider} className="w-8 h-8 rounded-full object-cover"/>
                    {record.provider}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-300">{record.offer}</td>
                <td className={`px-4 py-4 whitespace-nowrap font-bold flex items-center gap-2 ${status.color}`}>
                    <FaCoins />
                    <span>+{record.reward}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt />
                    {record.date}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-2 text-xs ${status.bg} ${status.color}`}>
                        {status.icon}
                        {record.status}
                    </span>
                </td>
                </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default HistoryTable;
