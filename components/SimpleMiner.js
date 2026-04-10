'use client';

import React, { useState, useRef } from 'react';
import { useStats } from '../context/StatsContext';
import { getToken } from '../lib/tokenManager';
import { FaCog } from 'react-icons/fa';

const SimpleMiner = () => {
    const { userData, refreshUserData } = useStats();
    const [logs, setLogs] = useState([]);
    const [isMining, setIsMining] = useState(false);
    const terminalRef = useRef(null);

    const currentEnergy = userData?.balances?.energy || 0;
    const level = userData?.levelInfo?.level || 1;

    const addLog = (message) => {
        setLogs(prev => [...prev.slice(-100), {
            id: `${Date.now()}-${Math.random()}`,
            message
        }]);
    };

    const handleMine = async (amount) => {
        // Validar que haya energía
        if (currentEnergy < amount) {
            addLog(`❌ Error: Not enough energy. You have ${currentEnergy} energy, need ${amount}.`);
            return;
        }

        // Validar que estés logueado
        const token = getToken();
        if (!token) {
            addLog(`❌ Error: You must be logged in to mine.`);
            return;
        }

        setIsMining(true);
        addLog(`⛏️ Starting mining with ${amount} energy...`);

        try {
            const response = await fetch('/api/mine/status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ energyToConsume: amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    addLog(`❌ Session expired. Please login again.`);
                    localStorage.removeItem('token');
                    setTimeout(() => {
                        window.location.href = '/auth/login';
                    }, 2000);
                } else {
                    addLog(`❌ Error: ${data.message}`);
                }
                return;
            }

            // Éxito - mostrar resultados
            const reward = data.reward || 0;
            const xpGained = data.xpGained || 0;
            const newEnergy = data.newEnergyPoints || 0;
            const newLevel = data.currentLevel || level;
            const leveledUp = data.leveledUp || false;
            const newMaxEnergy = data.newMaxEnergy || 0;

            // Generar logs visuales estilo terminal
            const hashes = (Math.random() * (223.0 - 222.0) + 222.0).toFixed(2);
            const fundHash = Math.floor(Math.random() * 15) + 1;

            addLog(`✅ Mined ${amount} energy successfully!`);
            addLog(`💰 Reward: ${reward.toFixed(6)} SBT + ${reward.toFixed(6)} Tokens`);
            addLog(`⭐ XP Gained: ${xpGained}`);
            
            if (leveledUp) {
                addLog(`🎉 LEVEL UP! You are now level ${newLevel}!`);
                addLog(`⚡ Energy refilled to ${newMaxEnergy} (new max)!`);
            } else {
                addLog(`⚡ Remaining Energy: ${newEnergy}`);
            }

            addLog(`🔗 Pool: ${hashes} KH/s | Fund Hash: ${fundHash}`);

            // Refrescar datos del usuario
            refreshUserData();

        } catch (error) {
            console.error('Mining error:', error);
            addLog(`❌ Mining failed: ${error.message}`);
        } finally {
            setIsMining(false);
        }
    };

    // Auto-scroll del terminal
    React.useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-[#1e1e1e] text-white font-mono rounded-lg shadow-xl w-full max-w-4xl mx-auto border border-gray-700">
            <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-green-400">SimpleMiner</span>
                    <span className="text-gray-500 text-sm">
                        (Energy: {currentEnergy} | Level: {level})
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCog className={`cursor-pointer ${isMining ? 'animate-spin' : ''}`} />
                </div>
            </div>

            <div 
                ref={terminalRef}
                id="terminal" 
                className="p-4 h-64 overflow-y-auto text-sm"
            >
                {logs.length === 0 && (
                    <div className="text-gray-500 mb-2">
                        Ready to mine. Select an amount below.
                    </div>
                )}
                {logs.map(log => (
                    <div key={log.id} className="whitespace-pre-wrap text-green-300">
                        {log.message}
                    </div>
                ))}
                <div className="whitespace-pre-wrap">
                    <span className="text-cyan-400">super:~$ </span>
                    <span className="animate-pulse">_</span>
                </div>
            </div>

            <div className="bg-gray-900 px-4 py-2 rounded-b-lg flex flex-wrap justify-end items-center gap-3">
                <span className="text-gray-400 text-sm mr-2">Mine:</span>
                <button 
                    onClick={() => handleMine(1)} 
                    disabled={isMining || currentEnergy < 1}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded text-sm"
                >
                    1
                </button>
                <button 
                    onClick={() => handleMine(10)} 
                    disabled={isMining || currentEnergy < 10}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded text-sm"
                >
                    10
                </button>
                <button 
                    onClick={() => handleMine(50)} 
                    disabled={isMining || currentEnergy < 50}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded text-sm"
                >
                    50
                </button>
                <button 
                    onClick={() => handleMine(100)} 
                    disabled={isMining || currentEnergy < 100}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded text-sm"
                >
                    100
                </button>
                <button 
                    onClick={() => handleMine(Math.min(500, currentEnergy))} 
                    disabled={isMining || currentEnergy < 1}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded text-sm"
                >
                    MAX (500)
                </button>
            </div>
        </div>
    );
};

export default SimpleMiner;
