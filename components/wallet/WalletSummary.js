'use client';

import { FaWallet, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const WalletSummary = ({ balance, totalEarned, totalWithdrawn, onWithdrawClick }) => {

    const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

    return (
        <div className="bg-gray-800/60 rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 items-center">
                
                {/* Current Balance */}
                <div className="md:col-span-1 text-center md:text-left">
                    <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Current Balance</h2>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <FaWallet className="text-4xl text-cyan-300"/>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tighter">{formatNumber(balance)}</p>
                            <p className="text-sm text-gray-400">Bits</p>
                        </div>
                    </div>
                </div>

                {/* Key Stats */}
                <div className="md:col-span-1 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <h3 className="text-xs text-gray-400 uppercase mb-1">Total Earned</h3>
                        <p className="text-lg font-bold text-green-400 flex items-center justify-center gap-1.5">
                            <FaArrowUp/>
                            {formatNumber(totalEarned)}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xs text-gray-400 uppercase mb-1">Total Withdrawn</h3>
                        <p className="text-lg font-bold text-red-400 flex items-center justify-center gap-1.5">
                           <FaArrowDown/>
                           {formatNumber(totalWithdrawn)}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-1 flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 justify-center">
                    <button 
                        onClick={onWithdrawClick} // Use the passed handler
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                        Withdraw
                    </button>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                        Deposit
                    </button>
                </div>

            </div>
        </div>
    );
}

export default WalletSummary;
