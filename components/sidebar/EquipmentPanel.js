'use client';

import { FaGem, FaServer, FaBook, FaLaptop, FaBars } from 'react-icons/fa';

const hardwareItems = [
    { label: 'HW', icon: <FaServer size={28} className="text-red-400"/>, count: 219 },
    { label: 'SW', icon: <FaBook size={28} className="text-blue-400"/>, count: 142 },
    { label: 'ADM', icon: <FaLaptop size={28} className="text-purple-400"/>, count: 120 },
];

export default function EquipmentPanel() {
    return (
        <div className="p-3 bg-surface-800/60 rounded-lg text-white text-sm">
            {/* Total Value */}
            <div className="flex items-center justify-center gap-2 mb-3">
                <FaGem className="text-yellow-400"/>
                <span className="font-bold text-lg">1,244</span>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
                {hardwareItems.map(item => (
                    <div key={item.label} className="bg-surface-700/50 p-2 rounded-lg flex flex-col items-center justify-between">
                        <div className="text-xs font-bold text-surface-300 mb-1">{item.label}</div>
                        <div className="mb-1">{item.icon}</div>
                        <div className="bg-surface-900/70 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {item.count}
                        </div>
                    </div>
                ))}
            </div>

            {/* Profiles Button */}
            <button className="w-full flex items-center justify-center gap-2 py-2 bg-surface-700 hover:bg-surface-600 transition-colors rounded-md text-xs font-bold">
                <FaBars />
                EQUIPMENT PROFILES
            </button>
        </div>
    );
}
