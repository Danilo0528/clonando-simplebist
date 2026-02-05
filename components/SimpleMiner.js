'use client';

import React, { useState } from 'react';
import { useStats } from '../context/StatsContext';
import { FaCog } from 'react-icons/fa';

const SimpleMiner = () => {
    const { earnExperience } = useStats();
    const [logs, setLogs] = useState([]);

    const handleMine = (amount) => {
        const newLogs = [];
        for (let i = 0; i < amount; i++) {
            const hashes = (Math.random() * (223.0 - 222.0) + 222.0).toFixed(2);
            const exp = Math.floor(Math.random() * 2000) + 500;
            const fundHash = Math.floor(Math.random() * 15) + 1;

            newLogs.push({ 
                id: `${Date.now()}-${i}`,
                message: `super:~$ Kirito0528 added ${hashes} KH to the pool and received ${exp} exp` 
            });
            newLogs.push({ 
                id: `${Date.now()}-${i}-fund`,
                message: `super:~$ Kirito0528 obtained ${fundHash} Fund Hash` 
            });

            earnExperience('mining', exp);
        }

        setLogs(prev => [...prev, ...newLogs].slice(-100));
    };

    return (
        <div className="bg-[#1e1e1e] text-white font-mono rounded-lg shadow-xl w-full max-w-4xl mx-auto border border-gray-700">
            <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-green-400">SimpleMiner</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCog className="cursor-pointer" />
                </div>
            </div>

            <div id="terminal" className="p-4 h-64 overflow-y-auto text-sm">
                {logs.map(log => (
                    <div key={log.id} className="whitespace-pre-wrap">
                        {log.message}
                    </div>
                ))}
                <div className="whitespace-pre-wrap">
                    <span>super:~$ </span><span className="animate-pulse">_</span>
                </div>
            </div>

            <div className="bg-gray-900 px-4 py-2 rounded-b-lg flex justify-end items-center gap-4">
                <button onClick={() => handleMine(1)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded">Swap</button>
                <button onClick={() => handleMine(20)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded">20</button>
                <button onClick={() => handleMine(100)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded">100</button>
                <button onClick={() => handleMine(500)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded">500</button>
                <button onClick={() => handleMine(500)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded">Auto 500</button>
            </div>
        </div>
    );
};

export default SimpleMiner;
