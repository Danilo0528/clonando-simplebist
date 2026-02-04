'use client';

import { useState, useEffect } from 'react';
import { FaGift } from 'react-icons/fa';

const DailyReward = () => {
    // Initial time in seconds from the image: 10h 35m 48s
    const initialTime = (10 * 3600) + (35 * 60) + 48;
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="px-2 pb-2">
            <div className="bg-surface-800/60 rounded-md p-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <FaGift className="text-yellow-400" size={18}/>
                    <span className="font-bold text-white text-xs">DAILY REWARD</span>
                </div>
                <span className="font-semibold text-white bg-surface-900/50 px-2 py-0.5 rounded-md text-xs">
                    {formatTime(timeLeft)}
                </span>
            </div>
        </div>
    );
};

export default DailyReward;
