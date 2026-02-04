'use client';

import { useState, useEffect } from 'react';
import { FaBolt, FaStar } from 'react-icons/fa';

const UserStatus = () => {
    const [time, setTime] = useState(79);
    const [energy, setEnergy] = useState(1937);
    const [isClient, setIsClient] = useState(false);
    const maxEnergy = 3693;

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => {
            setTime(prevTime => {
                if (prevTime <= 1) {
                    setEnergy(prev => Math.min(prev + 8, maxEnergy));
                    return 300;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-3 border-b border-surface-700">
            {/* Level and Timer */}
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg text-white">Lv. 525</span>
                <span className="flex items-center text-yellow-400 font-semibold text-sm">
                    <FaBolt className="mr-1" /> {formatTime(time)}
                </span>
            </div>

            <div className="space-y-3">
                {/* Energy Bar - Corrected Layout */}
                <div className="flex items-center gap-2">
                    <div className="bg-surface-800 p-1.5 rounded-md">
                       <FaBolt className="text-green-400" />
                    </div>
                    <div className="w-full space-y-1">
                        <div className="text-sm">
                            <span className="text-gray-300 font-medium">
                                {isClient ? energy.toLocaleString() : energy} / {isClient ? maxEnergy.toLocaleString() : maxEnergy}
                            </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(energy/maxEnergy)*100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Experience Bar - Corrected Layout */}
                <div className="flex items-center gap-2">
                    <div className="bg-surface-800 p-1.5 rounded-md">
                        <FaStar className="text-blue-400" />
                    </div>
                    <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300 font-medium">10,161 / 11,325</span>
                            <span className="text-gray-400 text-xs font-medium">TNL 1,164</span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89.7%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatus;
