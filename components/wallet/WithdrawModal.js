'use client';

import { useState } from 'react';
import { useStats } from '../../context/StatsContext';
import { FaTimes, FaBitcoin, FaEthereum, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { SiLitecoin } from 'react-icons/si';

const cryptoOptions = [
    { name: 'Bitcoin', icon: <FaBitcoin/>, symbol: 'BTC' },
    { name: 'Ethereum', icon: <FaEthereum/>, symbol: 'ETH' },
    { name: 'Litecoin', icon: <SiLitecoin/>, symbol: 'LTC' },
];

const WithdrawModal = ({ isOpen, onClose, balance, onWithdrawalSuccess }) => {
    const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
    const [walletAddress, setWalletAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const { refreshUserData } = useStats(); // Import refresh function from context

    if (!isOpen) return null;

    const handleCryptoSelect = (crypto) => {
        setSelectedCrypto(crypto);
    };

    const handleMaxAmount = () => {
        setAmount(balance);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseFloat(amount) > balance) {
            setStatus('error');
            setFeedbackMessage('Amount cannot exceed your current balance.');
            return;
        }
        if (!walletAddress || !amount || parseFloat(amount) <= 0) {
            setStatus('error');
            setFeedbackMessage('Please fill in all fields correctly.');
            return;
        }

        setStatus('submitting');
        setFeedbackMessage('');

        try {
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crypto: selectedCrypto.symbol,
                    address: walletAddress,
                    amount: parseFloat(amount)
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }

            setStatus('success');
            setFeedbackMessage(data.message);
            if(onWithdrawalSuccess) {
                // Create a new transaction object to update the UI
                const newTransaction = {
                    id: data.transactionId,
                    type: 'Withdrawal',
                    description: `Withdraw to ${selectedCrypto.symbol}`,
                    amount: -parseFloat(amount),
                    status: 'Processing', // Or whatever status the API returns
                    date: new Date().toISOString(),
                };
                onWithdrawalSuccess(newTransaction);
                
                // Refresh user data to ensure all components have updated information
                if (refreshUserData) {
                    await refreshUserData();
                }
            }

        } catch (err) {
            setStatus('error');
            setFeedbackMessage(err.message);
        }
    };

    const resetAndClose = () => {
        setWalletAddress('');
        setAmount('');
        setStatus('idle');
        setFeedbackMessage('');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-auto transform transition-all duration-300 scale-100">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="p-8 text-center">
                        <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4"/>
                        <h3 className="text-2xl font-bold text-white mb-2">Withdrawal Initiated</h3>
                        <p className="text-gray-300 mb-6">{feedbackMessage}</p>
                        <button onClick={resetAndClose} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg">Done</button>
                    </div>
                ) : (
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Select Cryptocurrency</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {cryptoOptions.map(crypto => (
                                        <button
                                            type="button"
                                            key={crypto.symbol}
                                            onClick={() => handleCryptoSelect(crypto)}
                                            className={`flex flex-col items-center justify-center p-3 bg-gray-700 rounded-lg hover:bg-cyan-500/20 border-2 transition-all ${selectedCrypto.symbol === crypto.symbol ? 'border-cyan-500' : 'border-transparent'}`}>
                                            <div className={`text-2xl ${selectedCrypto.symbol === crypto.symbol ? 'text-cyan-400' : 'text-gray-400'}`}>{crypto.icon}</div>
                                            <p className="text-white font-semibold text-sm mt-1">{crypto.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">{selectedCrypto.name} Wallet Address</label>
                                <input
                                    type="text"
                                    id="walletAddress"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder={`Enter your ${selectedCrypto.symbol} address`}
                                />
                            </div>

                            <div className="mb-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount (Bits)</label>
                                    <button type="button" onClick={handleMaxAmount} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">MAX</button>
                                </div>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus-500"
                                    placeholder="e.g., 50000"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-sm text-red-400 my-3 p-3 bg-red-500/10 rounded-lg">
                                    <FaExclamationTriangle/>
                                    <span>{feedbackMessage}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                {status === 'submitting' && <FaSpinner className="animate-spin"/>}
                                {status === 'submitting' ? 'Processing...' : 'Review Withdrawal'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawModal;
