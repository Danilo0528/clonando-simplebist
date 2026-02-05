'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCoins, FaChartLine, FaSpinner, FaFaucet } from 'react-icons/fa';
import axios from '../../lib/axiosConfig';

const PotentialEarningsDetailed = ({ user }) => {
  const [potentialEarnings, setPotentialEarnings] = useState({
    faucet: { amount: 0, available: false, timeLeft: '' },
    mining: { amount: 0, status: 'inactive' },
    ptc: { amount: 0, available: false },
    shortlinks: { amount: 0, available: false },
    total: 0
  });
  const [loading, setLoading] = useState(true);

  // Memoizar las funciones helper para evitar recreaciones innecesarias
  const getUserLevel = useCallback(() => {
    if (user && typeof user === 'object') {
      // Check for direct level property (original API response)
      if (user.level !== undefined) {
        return user.level;
      }
      // Check for level in balances (from StatsContext)
      if (user.balances && user.balances.level !== undefined) {
        return user.balances.level;
      }
      // Check for level in levelInfo (from StatsContext)
      if (user.levelInfo && user.levelInfo.level !== undefined) {
        return user.levelInfo.level;
      }
    }
    return 1; // Default level
  }, [user]);

  const getUserEnergy = useCallback(() => {
    if (user && typeof user === 'object') {
      // Check for direct energyPoints property (original API response)
      if (user.energyPoints !== undefined) {
        return user.energyPoints;
      }
      // Check for energy in balances (from StatsContext)
      if (user.balances && user.balances.energy !== undefined) {
        return user.balances.energy;
      }
    }
    return 100; // Default energy
  }, [user]);

  const fetchPotentialEarnings = useCallback(async () => {
    try {
      setLoading(true);
      
      const userLevel = getUserLevel();
      const userEnergy = getUserEnergy();

      // Obtener datos de ganancias potenciales de diferentes fuentes
      const [faucetData, miningData] = await Promise.allSettled([
        axios.get('/api/faucet/status'),
        axios.get('/api/mine/status')
      ]);

      let faucetInfo = { amount: 0, available: false, timeLeft: '' };
      let miningInfo = { amount: 0, status: 'inactive' };

      // Procesar datos del faucet
      if (faucetData.status === 'fulfilled') {
        const data = faucetData.value.data;
        faucetInfo = {
          amount: data.reward || 0,
          available: data.isReady || false,
          timeLeft: formatTime(data.timeLeft || 0)
        };
      } else {
        // Datos simulados basados en el nivel del usuario
        const baseFaucetReward = 100 + (userLevel * 10);
        const canClaim = Math.random() > 0.7; // 30% de probabilidad de poder reclamar
        faucetInfo = {
          amount: baseFaucetReward,
          available: canClaim,
          timeLeft: canClaim ? '' : '00:45:12'
        };
      }

      // Procesar datos de minería
      if (miningData.status === 'fulfilled') {
        const data = miningData.value.data;
        miningInfo = {
          amount: data.potentialReward || 0,
          status: data.status || 'inactive'
        };
      } else {
        // Simular ganancia de minería basada en nivel y energía
        const baseMiningReward = userLevel * userEnergy * 0.01;
        miningInfo = {
          amount: parseFloat(baseMiningReward.toFixed(2)),
          status: 'active'
        };
      }

      // Calcular ganancias potenciales de otras fuentes
      const ptcAmount = userLevel * 0.02;
      const shortlinksAmount = userLevel * 0.03;

      setPotentialEarnings({
        faucet: faucetInfo,
        mining: miningInfo,
        ptc: { amount: parseFloat(ptcAmount.toFixed(2)), available: true },
        shortlinks: { amount: parseFloat(shortlinksAmount.toFixed(2)), available: true },
        total: parseFloat(
          (faucetInfo.amount + miningInfo.amount + ptcAmount + shortlinksAmount).toFixed(2)
        )
      });
    } catch (error) {
      console.error('Error fetching potential earnings:', error);
      
      const userLevel = getUserLevel();
      const userEnergy = userLevel * 50; // Default energy calculation for fallback

      // Usar valores simulados si ocurre un error
      const baseFaucetReward = 100 + (userLevel * 10);
      const baseMiningReward = userLevel * userEnergy * 0.01;
      const ptcAmount = userLevel * 0.02;
      const shortlinksAmount = userLevel * 0.03;

      setPotentialEarnings({
        faucet: {
          amount: baseFaucetReward,
          available: Math.random() > 0.7,
          timeLeft: Math.random() > 0.7 ? '' : '00:45:12'
        },
        mining: {
          amount: parseFloat(baseMiningReward.toFixed(2)),
          status: 'active'
        },
        ptc: { amount: parseFloat(ptcAmount.toFixed(2)), available: true },
        shortlinks: { amount: parseFloat(shortlinksAmount.toFixed(2)), available: true },
        total: parseFloat(
          (baseFaucetReward + baseMiningReward + ptcAmount + shortlinksAmount).toFixed(2)
        )
      });
    } finally {
      setLoading(false);
    }
  }, [getUserLevel, getUserEnergy]);

  // Función para formatear tiempo
  const formatTime = useCallback((seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Solo ejecutar cuando el usuario cambie
  useEffect(() => {
    if (user) {
      fetchPotentialEarnings();
    }
  }, [user, fetchPotentialEarnings]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="bg-[#0F1014] pl-2 pr-3 py-1.5 rounded-md flex items-center gap-2">
        <FaSpinner className="text-yellow-400 animate-spin" />
        <span className="font-semibold text-sm text-white">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Botón principal que muestra ganancias potenciales totales */}
      <button className="bg-[#0F1014] hover:bg-black/50 pl-2 pr-3 py-1.5 rounded-md flex items-center gap-2 transition-colors duration-200">
        <FaChartLine className="text-green-400" />
        <span className="font-semibold text-sm text-white">
          +{potentialEarnings.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </button>

      {/* Menú desplegable con detalles de ganancias potenciales */}
      <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-72 bg-[#2a2c3a] rounded-md shadow-lg py-1 z-50 border border-gray-700">
        <div className="px-3 py-2 border-b border-gray-700">
          <span className="text-xs font-semibold text-gray-400">Ganancias Potenciales</span>
        </div>
        <div className="py-1">
          <div className="px-3 py-2 flex justify-between items-center text-sm text-white">
            <span className="flex items-center gap-2">
              <FaCoins className="text-yellow-400" /> Faucet
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono">+{potentialEarnings.faucet.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {!potentialEarnings.faucet.available && potentialEarnings.faucet.timeLeft && (
                <span className="text-xs text-gray-400 ml-1">({potentialEarnings.faucet.timeLeft})</span>
              )}
            </div>
          </div>
          <div className="px-3 py-2 flex justify-between items-center text-sm text-white">
            <span className="flex items-center gap-2">
              <FaCoins className="text-blue-400" /> Mining
            </span>
            <span className="font-mono">+{potentialEarnings.mining.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="px-3 py-2 flex justify-between items-center text-sm text-white">
            <span className="flex items-center gap-2">
              <FaCoins className="text-purple-400" /> PTC
            </span>
            <span className="font-mono">+{potentialEarnings.ptc.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="px-3 py-2 flex justify-between items-center text-sm text-white">
            <span className="flex items-center gap-2">
              <FaCoins className="text-green-400" /> Shortlinks
            </span>
            <span className="font-mono">+{potentialEarnings.shortlinks.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="px-3 py-2 mt-1 border-t border-gray-700 flex justify-between items-center text-sm text-white font-bold">
            <span>Total Estimado</span>
            <span className="font-mono text-yellow-400">+{potentialEarnings.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        {/* Botón para abrir el modal del faucet */}
        <div className="px-3 py-2 border-t border-gray-700">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Abrir el modal del faucet si existe la función global
              if (window.openFaucetModal) {
                window.openFaucetModal();
              } else {
                // Si no existe la función global, redirigir a la página del faucet
                window.location.href = '/faucet';
              }
            }}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white py-2 px-3 rounded-md text-sm flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <FaFaucet className="text-sm" /> Claim Faucet
          </button>
        </div>
      </div>
    </div>
  );
};

export default PotentialEarningsDetailed;