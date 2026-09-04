'use client';

import { useState, useEffect } from 'react';
import { useStats } from '../../context/StatsContext';
import { FaBolt, FaStar } from 'react-icons/fa';
import { AnimatedNumber } from '../../hooks/useAnimatedCounter';

const UserStatus = () => {
    const { userData } = useStats();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isClient, setIsClient] = useState(false); // Flag para hidratación

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Valores
    const userLevel = userData?.levelInfo?.level || 1;
    const currentEnergy = userData?.balances?.energy || 100;
    const energyRegenerationRate = userData?.energyRegenerationRate || 8;
    const maxEnergy = userData?.balances?.maxEnergy || (100 + (userLevel * 10));
    
    // Calcular tiempo para próxima regeneración
    useEffect(() => {
        if (!userData?.lastEnergyUpdate || !isClient) return;

        const timer = setInterval(() => {
            const lastUpdate = new Date(userData.lastEnergyUpdate);
            const now = new Date();
            const timeDiff = now - lastUpdate;
            
            // Ciclos de 5 minutos (300,000 ms)
            const msInCycle = 5 * 60 * 1000;
            const msPassedInCycle = timeDiff % msInCycle;
            const msRemaining = msInCycle - msPassedInCycle;
            
            setTimeLeft(Math.max(0, Math.floor(msRemaining / 1000)));
        }, 1000);

        return () => clearInterval(timer);
    }, [userData?.lastEnergyUpdate, isClient]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    };

    return (
        <div className="p-2 border-b border-surface-700 bg-surface-800/50">
            {/* Level and Energy Info - Compactado */}
            <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-base text-white">Lv. {userLevel}</span>
                {isClient && (
                    <span className="text-xs text-gray-400 font-mono">
                        +{energyRegenerationRate} in {formatTime(timeLeft)}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                {/* Energy Bar */}
                <div className="flex items-center gap-2">
                    <div className="bg-surface-800 p-1 rounded-md">
                       <FaBolt className="text-green-400" />
                    </div>
                    <div className="w-full space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300 font-medium">
                                <AnimatedNumber value={currentEnergy} decimals={0} /> / {maxEnergy}
                            </span>
                            <span className="text-gray-400 text-[10px]">
                                Recupera con PTC/Faucet
                            </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((currentEnergy / maxEnergy) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Experience Bar */}
                <div className="flex items-center gap-2">
                    <div className="bg-surface-800 p-1 rounded-md">
                        <FaStar className="text-blue-400" />
                    </div>
                    <div className="w-full space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300 font-medium">
                                <AnimatedNumber value={userData?.levelInfo?.xpInCurrentLevel || 0} decimals={0} /> / {userData?.levelInfo?.xpNeededForNextLevel || 100}
                            </span>
                            <span className="text-gray-400 text-[10px] font-medium">
                                TNL {userData?.levelInfo?.xpNeededForNextLevel - userData?.levelInfo?.xpInCurrentLevel || 0}
                            </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${userData?.levelInfo?.progressPercentage || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatus;
