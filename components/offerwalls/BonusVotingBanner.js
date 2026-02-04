'use client';

import { useState, useEffect } from 'react';
import { FaGift } from 'react-icons/fa';

const BonusVotingBanner = () => {
    // Initial time: 84 days, 17 hours, 19 minutes, 24 seconds
    const initialTime = (84 * 24 * 3600) + (17 * 3600) + (19 * 60) + 24;
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `ENDS IN ${d} DAYS, ${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-surface-800/70 rounded-lg p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <FaGift className="text-red-500 text-3xl" />
                <div>
                    <h3 className="font-bold text-white">Offerwalls Bonus Voting</h3>
                    <p className="text-sm text-gray-400">Vote for your favorite Offerwall for the next weekly bonus!</p>
                </div>
            </div>
            <div className="text-sm font-semibold text-gray-300 bg-surface-900/50 px-3 py-1 rounded-md">
                {formatTime(timeLeft)}
            </div>
        </div>
    );
};

export default BonusVotingBanner;
