'use client';

import { FaChevronRight } from 'react-icons/fa';

const stats = [
    { label: 'Total Sha', value: '454.79' },
    { label: 'Energy', value: '3693' },
    { label: 'Total Ethash', value: '579.47' },
    { label: 'Total Scrypt', value: '529.40' },
    { label: 'Algo Mod', value: '0.022' },
    { label: 'Regen Frequency', value: '296' },
];

const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-xs py-1 border-b border-surface-700/50 last:border-b-0">
        <div className="flex items-center gap-2">
            <FaChevronRight className="text-green-400" size={8}/>
            <span className="text-surface-300 font-medium">{label}</span>
        </div>
        <span className="font-semibold text-white">{value}</span>
    </div>
)

export default function StatsPanel() {
    return (
        <div className="p-3 bg-surface-800/60 rounded-lg text-white">
            <div className="space-y-1">
                 {stats.map(stat => (
                    <StatRow key={stat.label} label={stat.label} value={stat.value} />
                ))}
            </div>
        </div>
    );
}
