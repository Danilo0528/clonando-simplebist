'use client';

import { useState, useEffect } from 'react';
import { FaHome, FaChevronRight, FaCoins, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-400 mb-6 bg-gray-800/50 p-2 rounded-md">
      <FaHome className="mr-2" />
      <span>Dashboard</span>
      <FaChevronRight className="mx-2 text-xs" />
      <span className="text-white">Faucet</span>
    </div>
);

const RewardDetailsCard = () => (
    <div className="bg-[#252736] rounded-lg p-6 flex-1">
        <h2 className="text-lg font-bold text-white mb-4">Reward Details</h2>
        <ul className="space-y-3 text-gray-300">
            <li className="flex justify-between items-center"><span>Faucet Timer</span> <span>30 Minutes</span></li>
            <li className="flex justify-between items-center"><span>Base Reward</span> <span className="flex items-center gap-1"><FaCoins className="text-yellow-400" /> 5.5</span></li>
            <li className="flex justify-between items-center"><span>Level Bonus</span> <span className="flex items-center gap-1"><FaCoins className="text-yellow-400" /> 0.1838</span></li>
            <li className="flex justify-between items-center"><span>Exp</span> <span className="flex items-center gap-1"><FaStar className="text-blue-400" /> 50</span></li>
        </ul>
    </div>
);

const FaucetInfoCard = () => (
    <div className="bg-[#252736] rounded-lg p-6 flex-1 relative overflow-hidden">
        <h2 className="text-lg font-bold text-yellow-400 mb-4">Faucet Information</h2>
        <p className="text-gray-400 text-sm">
            The claims are linked to your ip address and the account, you run the risk of being banned in case links between accounts are found, the use of VPN, Proxy or any other method to change your ip is prohibited.
        </p>
        <FaCoins className="absolute -right-2 top-10 text-5xl text-yellow-400/20 transform rotate-12" />
        <FaCoins className="absolute -right-4 bottom-12 text-7xl text-yellow-400/20 transform -rotate-12" />
        <FaCoins className="absolute right-10 bottom-2 text-4xl text-yellow-400/20 transform rotate-6" />
    </div>
);

const CaptchaModal = ({ onVerify, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#1e202b] rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold mb-4">Complete the action</h3>
            <p className="text-gray-400 mb-6">Please check the box below to receive your reward.</p>
            <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-md">
                <input type="checkbox" className="form-checkbox h-6 w-6 bg-gray-800 border-gray-600 rounded" />
                <span className="text-white">I am not a robot</span>
            </div>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button onClick={onVerify} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Claim</button>
            </div>
        </div>
    </div>
);

export default function FaucetPage() {
    const FAUCET_COOLDOWN = 30 * 60; // 30 minutes in seconds
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const lastClaimTime = localStorage.getItem('lastFaucetClaim');
        if (lastClaimTime) {
            const timePassed = Math.floor((Date.now() - parseInt(lastClaimTime)) / 1000);
            const timeRemaining = FAUCET_COOLDOWN - timePassed;
            if (timeRemaining > 0) {
                setCooldown(timeRemaining);
            }
        }
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleStartClaim = () => {
        setShowCaptcha(true);
    };

    const handleVerifyClaim = () => {
        setShowCaptcha(false);
        toast.success('Reward claimed successfully!');
        const now = Date.now();
        localStorage.setItem('lastFaucetClaim', now.toString());
        setCooldown(FAUCET_COOLDOWN);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {showCaptcha && <CaptchaModal onVerify={handleVerifyClaim} onCancel={() => setShowCaptcha(false)} />}
        
        <Breadcrumb />
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <RewardDetailsCard />
            <FaucetInfoCard />
        </div>

        <div className="flex-grow flex items-center justify-center">
            {cooldown > 0 ? (
                 <div className="text-center">
                    <p className="text-gray-400 mb-2">Next claim available in:</p>
                    <p className="text-4xl font-bold text-white">{formatTime(cooldown)}</p>
                </div>
            ) : (
                <button 
                    onClick={handleStartClaim}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg shadow-teal-500/20">
                    Start
                </button>
            )}
        </div>
    </div>
  );
}
