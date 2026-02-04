'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStats } from '../context/StatsContext';
import { FaPlay, FaStop, FaTachometerAlt, FaAngleDoubleRight } from 'react-icons/fa';

const SimpleMiner = ({ coin = 'bitcoin' }) => {
  const [logs, setLogs] = useState([]);
  const [energyInput, setEnergyInput] = useState(20); // Default energy input
  const [energy, setEnergy] = useState(100); // Current energy level
  const logContainerRef = useRef(null);

  const { userData, updateBalance, earnExperience } = useStats();

  // Initialize energy from context
  useEffect(() => {
    if (userData && userData.balances) {
      setEnergy(userData.balances.energy || 100);
    }
  }, [userData]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { timestamp, message, type };
    setLogs(prevLogs => [...prevLogs, newLog]);
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  }

  const handleMine = useCallback(async () => {
    // Check if we have enough energy
    if (energy < energyInput) {
      addLog(`Not enough energy to mine. Need ${energyInput}, have ${energy}.`, 'error');
      return;
    }

    // Spend energy for mining
    const energySpent = energyInput;
    const newEnergy = energy - energySpent;
    setEnergy(newEnergy);
    updateBalance('energy', -energySpent);

    try {
      // Calculate rewards based on energy invested (more energy = more potential reward)
      // Also factor in user level for better rewards
      const levelMultiplier = (userData.balances.level || 1) * 0.05; // Lower multiplier for manual mining
      const baseReward = energySpent * (0.05 + Math.random() * 0.05); // 0.05-0.10 per energy unit
      const rewardWithLevel = baseReward * (1 + levelMultiplier);

      // Calculate hash power based on energy invested
      const hashPower = energySpent * 10; // 10 KH per energy unit

      // Earn experience for mining - proportional to energy spent
      const expEarned = earnExperience('mining', energySpent);

      addLog(`Mined ${hashPower.toFixed(0)} KH on ${coin.toUpperCase()}! +${rewardWithLevel.toFixed(2)} SCOINS | +${expEarned.toFixed(1)} XP`, 'success');
      window.dispatchEvent(new CustomEvent('balanceUpdated'));
    } catch (error) {
      console.error('Mining request failed:', error);
      addLog('Mining failed. Retrying...', 'error');
      // Restore energy if mining failed
      setEnergy(prev => prev + energySpent);
      updateBalance('energy', energySpent);
    }
  }, [energy, energyInput, coin, userData, updateBalance, earnExperience, addLog]);

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-auto font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center">
            <FaTachometerAlt className="text-blue-400 text-2xl mr-3"/>
            <div>
                <h3 className="text-xl font-bold text-white capitalize">{coin} Miner</h3>
                <p className="text-sm text-gray-400">Mining {coin.charAt(0).toUpperCase() + coin.slice(1)} network</p>
            </div>
        </div>
        <div className="flex items-center">
            <span className="text-sm font-bold text-gray-400">
                Energy: {energy.toFixed(0)}
            </span>
        </div>
      </div>

      {/* Log Console */}
      <div ref={logContainerRef} className="bg-black bg-opacity-50 text-sm font-mono rounded-lg p-4 h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black mb-5 shadow-inner">
        {logs.length === 0 && <span className="text-gray-500">[SYSTEM] Enter energy amount and press Mine to start.</span>}
        {logs.map((log, index) => (
          <div key={index} className="flex items-start">
            <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
            <FaAngleDoubleRight className="text-gray-600 mr-2 mt-1"/>
            <p className={`${getLogColor(log.type)}`}>{log.message}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Energy Input */}
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-around shadow-md">
            <span className="text-gray-300 font-bold text-sm mr-3">ENERGY</span>
            <input
              type="number"
              value={energyInput}
              onChange={(e) => setEnergyInput(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={energy}
              className="bg-gray-700 text-white text-center w-16 py-1 rounded border border-gray-600"
            />
        </div>

        {/* Mine Button */}
        <button
            onClick={handleMine}
            disabled={energy < energyInput}
            className={`w-full font-bold py-3 px-4 rounded-lg text-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-xl ${(energy >= energyInput) ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
            <FaPlay className="mr-2"/>
            Mine with {energyInput} Energy
        </button>
      </div>
    </div>
  );
};

export default SimpleMiner;
