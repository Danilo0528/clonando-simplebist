'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStats } from '../../context/StatsContext'; // Corrected import path
import { FaCoins, FaClock, FaGift, FaSpinner } from 'react-icons/fa';

const Faucet = () => {
    const { refreshUserData } = useStats();
    const [faucetData, setFaucetData] = useState({ isReady: false, timeLeft: 0, reward: 0 });
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchFaucetStatus = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/faucet');
            if (!res.ok) throw new Error('Could not fetch faucet status.');
            const data = await res.json();
            setFaucetData({ ...data, timeLeft: data.timeLeft > 0 ? data.timeLeft : 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaucetStatus();
    }, [fetchFaucetStatus]);

    useEffect(() => {
        if (!faucetData.isReady && faucetData.timeLeft > 0) {
            const timer = setInterval(() => {
                setFaucetData(prevData => {
                    const newTimeLeft = prevData.timeLeft - 1;
                    if (newTimeLeft <= 0) {
                        clearInterval(timer);
                        return { ...prevData, timeLeft: 0, isReady: true };
                    }
                    return { ...prevData, timeLeft: newTimeLeft };
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (faucetData.timeLeft <= 0) {
             setFaucetData(prevData => ({ ...prevData, isReady: true }));
        }
    }, [faucetData.isReady, faucetData.timeLeft]);

    const handleClaim = async () => {
        if (!faucetData.isReady || claiming) return;

        setClaiming(true);
        setError(null);
        setSuccessMessage('');

        try {
            const res = await fetch('/api/faucet', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to claim from faucet.');
            }
            
            setSuccessMessage(data.message);
            await refreshUserData(); // Refresh global user stats
            await fetchFaucetStatus(); // Re-fetch faucet status to start timer

        } catch (err) {
            setError(err.message);
        } finally {
            setClaiming(false);
            setTimeout(() => setSuccessMessage(''), 4000); // Clear message after a few seconds
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    
    if (loading) {
        return (
            <div className="bg-gray-800/60 rounded-2xl shadow-2xl max-w-2xl mx-auto p-8 text-center">
                <FaSpinner className="animate-spin text-4xl text-cyan-400 mx-auto" />
                <p className="mt-4 text-gray-300">Loading Faucet...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/60 rounded-xl shadow-2xl p-6 text-white text-center">
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Your Next Reward</h2>
                <p className="text-5xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                    <FaCoins className="text-yellow-400" />
                    {new Intl.NumberFormat('en-US').format(faucetData.reward)}
                    <span className="text-3xl text-gray-500">Bits</span>
                </p>
            </div>

            <div className="mb-6 h-12 flex flex-col justify-center items-center">
                {error && <p className="text-red-400 font-semibold">Error: {error}</p>}
                {successMessage && <p className="text-green-400 font-semibold">{successMessage}</p>}
                {!error && !successMessage && (
                     faucetData.isReady ? (
                        <p className="text-green-400 font-semibold">Your faucet is ready to claim!</p>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-lg">
                            <FaClock className="text-cyan-400" />
                            <span>Next claim in:</span>
                            <span className="font-mono text-xl font-bold tracking-wider">{formatTime(faucetData.timeLeft)}</span>
                        </div>
                    )
                )}
            </div>

            <button
                onClick={handleClaim}
                disabled={!faucetData.isReady || claiming || loading}
                className="w-full max-w-xs mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center text-lg"
            >
                {claiming ? <><FaSpinner className="animate-spin mr-2" />Claiming...</> : 'Claim Now'}
            </button>
        </div>
    );
};

export default Faucet;
