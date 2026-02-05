'use client';

import { useState, useEffect } from 'react';
import { useStats } from '../../context/StatsContext';
import { FaBolt, FaStar } from 'react-icons/fa';

const UserStatus = () => {
    const { userData } = useStats();
    const [isClient, setIsClient] = useState(false);
    
    // Valores predeterminados
    const userLevel = userData?.levelInfo?.level || userData?.balances?.level || 1;
    const currentEnergy = userData?.balances?.energy || 100;
    const energyRegenerationRate = 8; // 8 puntos cada 5 minutos por regeneración pasiva
    const maxEnergy = 100 + (userLevel * 10); // Energía máxima basada en nivel

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="p-3 border-b border-surface-700 bg-surface-800/50">
            {/* Level and Energy Info */}
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg text-white">Lv. {userLevel}</span>
                <span className="text-sm text-gray-400">
                    +{energyRegenerationRate}/5min
                </span>
            </div>

            <div className="space-y-3">
                {/* Energy Bar - Con sistema de recuperación por actividades */}
                <div className="flex items-center gap-2">
                    <div className="bg-surface-800 p-1.5 rounded-md">
                       <FaBolt className="text-green-400" />
                    </div>
                    <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300 font-medium">
                                {isClient ? currentEnergy.toLocaleString() : currentEnergy} / {maxEnergy}
                            </span>
                            <span className="text-gray-400 text-xs">
                                Recupera con PTC/Faucet
                            </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${Math.min((currentEnergy / maxEnergy) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Experience Bar - Mantenido igual */}
                <div className="flex items-center gap-2">
                    <div className="bg-surface-800 p-1.5 rounded-md">
                        <FaStar className="text-blue-400" />
                    </div>
                    <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300 font-medium">
                                {userData?.levelInfo?.xpInCurrentLevel || 0} / {userData?.levelInfo?.xpNeededForNextLevel || 100}
                            </span>
                            <span className="text-gray-400 text-xs font-medium">
                                TNL {userData?.levelInfo?.xpNeededForNextLevel - userData?.levelInfo?.xpInCurrentLevel || 0}
                            </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
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
