'use client';

import { 
    FaCoins, FaArrowUp, FaArrowDown, FaGift, FaUserFriends, FaCheckCircle, FaHourglassHalf 
} from 'react-icons/fa';
import { format } from 'date-fns';

const transactionDetails = {
    'Offerwall Reward': { icon: <FaCoins className="text-yellow-400"/>, color: 'text-green-400' },
    'Daily Reward': { icon: <FaGift className="text-purple-400"/>, color: 'text-green-400' },
    'Withdrawal': { icon: <FaArrowDown className="text-red-400"/>, color: 'text-red-400' },
    'Referral Bonus': { icon: <FaUserFriends className="text-blue-400"/>, color: 'text-green-400' },
};

const statusDetails = {
    'Completed': { icon: <FaCheckCircle className="text-green-500"/>, text: 'Completed' },
    'Pending': { icon: <FaHourglassHalf className="text-yellow-500"/>, text: 'Pending' },
};

const TransactionHistoryTable = ({ transactions }) => {

    const formatNumber = (num) => {
        const sign = num > 0 ? '+' : '';
        return sign + new Intl.NumberFormat('en-US').format(num);
    }

    return (
        <div className="bg-gray-800/60 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {transactions.map(tx => {
                            const details = transactionDetails[tx.type] || { icon: <FaCoins/>, color: 'text-gray-400' };
                            const status = statusDetails[tx.status] || { icon: null, text: 'Unknown' };

                            return (
                                <tr key={tx.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3 font-medium text-white">
                                            {details.icon}
                                            <span>{tx.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-300">{tx.description}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap font-bold ${details.color}`}>
                                        {formatNumber(tx.amount)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                                        {format(new Date(tx.date), 'MMM d, yyyy - h:mm a')}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className={`flex items-center gap-2 font-semibold text-xs ${status.text === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {status.icon}
                                            <span>{status.text}</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TransactionHistoryTable;
