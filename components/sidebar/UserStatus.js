'use client';

import { useState, useEffect } from 'react';
import { useStats } from '../../context/StatsContext';
import { FaBolt, FaStar } from 'react-icons/fa';

const UserStatus = () => {
    const { userData } = useStats();
    const [time, setTime] = useState(79);
    const [isClient, setIsClient] = useState(false);
    const maxEnergy = 3693; // Valor máximo de energía

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => {
            setTime(prevTime => {
                if (prevTime <= 1) {
                    // Aquí se debería llamar a una función para regenerar energía en el contexto
                    // Por ahora, simulamos la regeneración
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

    // Usamos la energía del contexto
    const energy = userData?.balances?.energy || 0;
    const calculatedPercentage = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;

    return (
        <div className="p-3 border-b border-surface-700">
            {/* Level and Timer */}
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg text-white">Lv. {userData?.balances?.level || 1}</span>
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
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${calculatedPercentage}%` }}></div>
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
                            <span className="text-gray-300 font-medium">
                                {userData?.balances?.expForCurrentLevel || 0} / {userData?.balances?.expForNextLevel || 100}
                            </span>
                            <span className="text-gray-400 text-xs font-medium">
                                TNL {userData?.balances?.expForNextLevel - userData?.balances?.expForCurrentLevel || 0}
                            </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${userData?.balances?.progressPercentage || 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatus;
