'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStats } from '../context/StatsContext';
import { FaBolt, FaCoins, FaClock, FaChartLine, FaPowerOff, FaPlay, FaPause, FaInfoCircle } from 'react-icons/fa';

const SimpleMiner = ({ isInitiallyActive = true }) => {
  const { userData, updateBalance, earnExperience, refreshUserData } = useStats();
  const [isActive, setIsActive] = useState(isInitiallyActive);
  const [energy, setEnergy] = useState(100);
  const [hashRate, setHashRate] = useState(0.1); // Starting hash rate
  const [logs, setLogs] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    hashesGenerated: 0,
    rewardsEarned: 0,
    timeMined: 0
  });
  const [efficiency, setEfficiency] = useState(100); // Efficiency percentage
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize energy from user data
  useEffect(() => {
    if (userData && userData.balances && userData.balances.energy) {
      setEnergy(userData.balances.energy);
    }
  }, [userData]);

  // Mining interval
  useEffect(() => {
    if (isActive && energy > 0) {
      intervalRef.current = setInterval(() => {
        // Calculate energy consumption (varies based on hash rate)
        const energyConsumption = hashRate * 0.05; // More efficient miners consume less energy
        
        // Calculate reward based on hash rate and efficiency
        const baseReward = hashRate * 0.001; // Base reward per tick
        const efficiencyMultiplier = efficiency / 100; // Convert percentage to multiplier
        const rewardWithEfficiency = baseReward * efficiencyMultiplier;
        
        // Apply level multiplier if user data exists
        const levelMultiplier = userData?.levelInfo?.level ? (1 + (userData.levelInfo.level * 0.1)) : 1;
        const rewardWithLevel = rewardWithEfficiency * levelMultiplier;
        
        // Calculate XP reward
        const xpReward = Math.floor(rewardWithLevel * 100); // Convert to XP
        
        setEnergy(prev => {
          const newEnergy = prev - energyConsumption;
          
          // Update balance with earned rewards
          if (rewardWithLevel > 0) {
            updateBalance('simplebits', rewardWithLevel);
            updateBalance('energy', -energyConsumption);
            earnExperience('mining', xpReward);
            
            // Update session stats
            setSessionStats(prevStats => ({
              ...prevStats,
              hashesGenerated: prevStats.hashesGenerated + hashRate,
              rewardsEarned: prevStats.rewardsEarned + rewardWithLevel,
              timeMined: prevStats.timeMined + 1
            }));
            
            // Add log entry
            addLog(`Mined ${(rewardWithLevel).toFixed(6)} SB with ${hashRate.toFixed(2)} H/s`, 'success');
          }
          
          return Math.max(0, newEnergy);
        });
      }, 1000); // Run every second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, energy, hashRate, efficiency, userData, updateBalance, earnExperience]);

  // Timer for session stats
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          timeMined: prev.timeMined + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Energy regeneration when not mining
  useEffect(() => {
    if (!isActive && energy < 100) {
      const energyRegenInterval = setInterval(() => {
        setEnergy(prev => Math.min(100, prev + 0.5)); // Regenerate 0.5 energy per second
      }, 1000);

      return () => clearInterval(energyRegenInterval);
    }
  }, [isActive, energy]);

  const toggleMining = () => {
    setIsActive(!isActive);
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      id: Date.now(),
      timestamp,
      message,
      type
    }, ...prev.slice(0, 9)]); // Keep only last 10 logs
  };

  const upgradeMiner = () => {
    if (userData && userData.balances && userData.balances.simplebits >= 1) {
      // Cost: 1 SB per upgrade
      updateBalance('simplebits', -1);
      setHashRate(prev => prev + 0.05); // Increase hash rate by 0.05
      setEfficiency(prev => Math.min(100, prev + 2)); // Improve efficiency
      addLog(`Miner upgraded! Hash rate: ${hashRate.toFixed(2)} → ${(hashRate + 0.05).toFixed(2)} H/s`, 'success');
    } else {
      addLog('Not enough SimpleBits to upgrade miner!', 'error');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedEarningsPerHour = (hashRate * 3600 * 0.001 * (efficiency / 100) * (userData?.levelInfo?.level ? (1 + (userData.levelInfo.level * 0.1)) : 1)).toFixed(4);

  return (
    <div className="bg-gray-800/60 rounded-2xl shadow-2xl max-w-2xl mx-auto p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaBolt className="text-yellow-400" />
          Simple Miner
        </h2>
        <button
          onClick={toggleMining}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isActive ? <><FaPause /> Pause</> : <><FaPlay /> Start</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {isActive ? 'Mining' : 'Paused'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaBolt className={isActive ? 'text-green-400 animate-pulse' : 'text-gray-500'} />
            <span>{hashRate.toFixed(2)} H/s</span>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Energy</span>
            <span className="text-sm">{energy.toFixed(1)}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(energy / 100) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Efficiency</span>
            <span className="text-sm">{efficiency}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${efficiency}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Est. Earnings</span>
            <span className="text-sm">/hr</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCoins className="text-yellow-400 text-sm" />
            <span className="font-mono">{estimatedEarningsPerHour}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <FaChartLine className="text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-cyan-400">{sessionStats.hashesGenerated.toFixed(0)}</div>
          <div className="text-xs text-gray-400">Hashes</div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <FaCoins className="text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">{sessionStats.rewardsEarned.toFixed(6)}</div>
          <div className="text-xs text-gray-400">Earned</div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <FaClock className="text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">{formatTime(sessionStats.timeMined)}</div>
          <div className="text-xs text-gray-400">Mined</div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={upgradeMiner}
          disabled={userData?.balances?.simplebits < 1}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FaPowerOff />
          Upgrade Miner (1 SB)
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Increases hash rate by 0.05 H/s and efficiency by 2%
        </p>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaInfoCircle className="text-cyan-400" />
          <h3 className="font-semibold">Mining Log</h3>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No mining activity yet...</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className={`flex items-center gap-2 text-sm ${
                log.type === 'success' ? 'text-green-400' : 
                log.type === 'error' ? 'text-red-400' : 'text-blue-400'
              }`}>
                <span className="text-xs text-gray-500">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
        <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <FaInfoCircle />
          How to Mine
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Click "Start" to begin mining SimpleBits</li>
          <li>• Mining consumes energy - manage it wisely!</li>
          <li>• Upgrade your miner to increase hash rate</li>
          <li>• Higher efficiency means better rewards</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleMiner;
