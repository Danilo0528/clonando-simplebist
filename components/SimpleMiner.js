'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaStop, FaTachometerAlt, FaAngleDoubleRight } from 'react-icons/fa';

const SimpleMiner = () => {
  const [logs, setLogs] = useState([]);
  const [isMining, setIsMining] = useState(false);
  const [mineSpeed, setMineSpeed] = useState(1000); // Default to 1 second
  const minerIntervalRef = useRef(null);
  const logContainerRef = useRef(null);

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
      default:
        return 'text-gray-300';
    }
  }

  const stopMining = useCallback(() => {
    if (minerIntervalRef.current) {
      clearInterval(minerIntervalRef.current);
      minerIntervalRef.current = null;
      setIsMining(false);
      addLog('Miner stopped. Ready to start again.', 'warning');
    }
  }, [addLog]);

  const handleMine = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      addLog('Authentication token not found. Stopping miner.', 'error');
      stopMining();
      return;
    }

    try {
      const response = await fetch('/api/mine', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        addLog(`+${data.xpGained} XP | Energy: ${data.newEnergy.toFixed(0)}`, 'success');
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        addLog(data.message, 'error');
        stopMining();
      }
    } catch (error) {
      console.error('Mining request failed:', error);
      addLog('Connection to server failed. Retrying...', 'error');
    }
  }, [addLog, stopMining]);

  const startMining = useCallback(() => {
    if (isMining) return;
    setIsMining(true);
    addLog('Initializing miner... Go!');
    handleMine(); // Immediate first mine
    minerIntervalRef.current = setInterval(handleMine, mineSpeed);
  }, [isMining, addLog, handleMine, mineSpeed]);

  useEffect(() => {
    return () => clearInterval(minerIntervalRef.current);
  }, []);

  const handleSpeedChange = (speed) => {
    setMineSpeed(speed);
    if (isMining) {
      // Immediately restart the interval with the new speed
      clearInterval(minerIntervalRef.current);
      minerIntervalRef.current = setInterval(handleMine, speed);
      const speedLabel = speed === 1000 ? '1x' : speed === 500 ? '2x' : '5x';
      addLog(`Speed changed to ${speedLabel}.`, 'info');
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center">
            <FaTachometerAlt className="text-blue-400 text-2xl mr-3"/>
            <div>
                <h3 className="text-xl font-bold text-white">Simple Miner</h3>
                <p className="text-sm text-gray-400">Automated XP and resource generation</p>
            </div>
        </div>
        <div className="flex items-center">
            <span className={`text-sm font-bold mr-3 ${isMining ? 'text-green-400' : 'text-red-500'}`}>
                {isMining ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <div className={`w-4 h-4 rounded-full border-2 border-gray-900 ${isMining ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* Log Console */}
      <div ref={logContainerRef} className="bg-black bg-opacity-50 text-sm font-mono rounded-lg p-4 h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black mb-5 shadow-inner">
        {logs.length === 0 && <span className="text-gray-500">[SYSTEM] Miner is idle. Press Start to begin.</span>}
        {logs.map((log, index) => (
          <div key={index} className="flex items-start">
            <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
            <FaAngleDoubleRight className="text-gray-600 mr-2 mt-1"/>
            <p className={`flex-1 ${getLogColor(log.type)}`}>{log.message}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Speed Controls */}
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-around shadow-md">
            <span className="text-gray-300 font-bold text-sm mr-3">SPEED</span>
            <button onClick={() => handleSpeedChange(1000)} className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ${mineSpeed === 1000 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>1x</button>
            <button onClick={() => handleSpeedChange(500)} className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ${mineSpeed === 500 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>2x</button>
            <button onClick={() => handleSpeedChange(200)} className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ${mineSpeed === 200 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>5x</button>
        </div>

        {/* Start/Stop Button */}
        <button 
            onClick={isMining ? stopMining : startMining}
            className={`w-full font-bold py-3 px-4 rounded-lg text-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-xl ${isMining ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600'}`}>
            {isMining ? <FaStop className="mr-2"/> : <FaPlay className="mr-2"/>}
            {isMining ? 'Stop Mining' : 'Start Mining'}
        </button>
      </div>
    </div>
  );
};

export default SimpleMiner;
