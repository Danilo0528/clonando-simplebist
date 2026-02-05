'use client';

import { useStats } from '../../context/StatsContext';
import { FaStar, FaLayerGroup, FaShieldAlt, FaBolt, FaDiceD20, FaSync } from 'react-icons/fa';

const StatRow = ({ icon, label, value }) => (
    <div className="flex justify-between items-center text-xs py-1.5">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-gray-300 font-medium">{label}</span>
        </div>
        <span className="font-bold text-white tracking-wider">{value}</span>
    </div>
)

export default function StatsPanel() {
    const { userData, loading } = useStats();

    if (loading || !userData) {
        return (
            <div className="p-3 bg-gray-800/60 rounded-lg text-center">
                <span className="text-xs text-gray-400">Loading stats...</span>
            </div>
        );
    }

    const { level = 1, xp = 0, xpInCurrentLevel = 0, xpNeededForNextLevel = 100 } = userData.levelInfo || {};
    const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    const stats = [
        { label: 'Total SHA', value: '454.79', icon: <FaShieldAlt className="text-red-400" /> },
        { label: 'Energy', value: '3693', icon: <FaBolt className="text-yellow-400" /> },
        { label: 'Algo Mod', value: '0.022', icon: <FaDiceD20 className="text-purple-400" /> },
        { label: 'Regen Freq', value: '296', icon: <FaSync className="text-blue-400" /> },
    ];

    return (
        <div className="p-3 bg-gray-800/60 rounded-lg text-white space-y-3">
            {/* XP and Level Progress */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <FaLayerGroup className="text-cyan-400"/> 
                        <span className="font-bold text-sm">Level {level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-400" />
                        <span className="font-bold text-sm">{xp} <span className="text-xs text-gray-400">XP</span></span>
                    </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                 <div className="text-xs text-gray-400 text-right mt-1">{xpInCurrentLevel} / {xpNeededForNextLevel}</div>
            </div>

            {/* Other Stats */}
            <div className="space-y-1 border-t border-gray-700/50 pt-2">
                 {stats.map(stat => (
                    <StatRow key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
                ))}
            </div>
        </div>
    );
}
