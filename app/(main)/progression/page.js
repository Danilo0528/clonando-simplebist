'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaMedal, FaStar, FaFire, FaChartLine, FaTrophy, FaUserFriends, FaInfoCircle, FaArrowUp, FaCoins } from 'react-icons/fa';

export default function ProgressionPage() {
  const [progression, setProgression] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const fetchProgression = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/progression', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progression stats');
      }

      const data = await response.json();

      // Also fetch user's level info with multiplier
      const levelInfoResponse = await fetch('/api/user/level-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (levelInfoResponse.ok) {
        const levelInfoData = await levelInfoResponse.json();
        setProgression({...data.progression, ...levelInfoData.levelInfo});
      } else {
        setProgression(data.progression);
      }
    } catch (error) {
      console.error('Error fetching progression:', error);
      setMessage('Error loading progression stats');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/progression', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 10 }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setMessage('Error loading leaderboard');
    } finally {
      setLbLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProgression();
    fetchLeaderboard();
  }, [fetchProgression, fetchLeaderboard]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-400 text-xs">Loading progression...</p>
        </div>
      </div>
    );
  }

  // Define multiplier tiers
  const getMultiplierTier = (level) => {
    if (level >= 41) return { tier: 'Elite', multiplier: 2.0, color: 'text-yellow-400', bg: 'from-yellow-600 to-yellow-800' };
    if (level >= 31) return { tier: 'Diamond', multiplier: 1.75, color: 'text-blue-400', bg: 'from-blue-600 to-blue-800' };
    if (level >= 21) return { tier: 'Platinum', multiplier: 1.5, color: 'text-gray-300', bg: 'from-gray-600 to-gray-800' };
    if (level >= 11) return { tier: 'Gold', multiplier: 1.25, color: 'text-yellow-500', bg: 'from-yellow-500 to-yellow-700' };
    if (level >= 6) return { tier: 'Silver', multiplier: 1.1, color: 'text-gray-400', bg: 'from-gray-500 to-gray-700' };
    return { tier: 'Bronze', multiplier: 1.0, color: 'text-yellow-700', bg: 'from-yellow-800 to-yellow-900' };
  };

  const tierInfo = getMultiplierTier(progression?.level || 1);

  return (
    <div className="p-1 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-bold text-sm">Progression</h1>
          <p>Track your level progression and achievements</p>
        </div>
        <div className="flex items-center text-[10px]">
          <span className="text-gray-400">Dashboard</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-blue-400">Progression</span>
        </div>
      </div>

      {/* Compact Stats Table */}
      <div className="mb-2 border border-gray-700 rounded-sm overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-1 text-left border-r border-gray-700">Stat</th>
              <th className="p-1 text-right">Value</th>
              <th className="p-1 text-left border-l border-gray-700">Stat</th>
              <th className="p-1 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="p-1 border-r border-gray-700">Level</td>
              <td className="p-1 text-right">#{progression?.level || 1}</td>
              <td className="p-1 border-l border-gray-700">Total XP</td>
              <td className="p-1 text-right">{progression?.totalXp || 0}</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="p-1 border-r border-gray-700">Multiplier</td>
              <td className="p-1 text-right">x{progression?.multiplier != null ? (typeof window !== 'undefined' ? progression.multiplier.toFixed(2) : progression.multiplier.toString()) : '1.00'}</td>
              <td className="p-1 border-l border-gray-700">Next Level</td>
              <td className="p-1 text-right">{progression?.nextLevel || 1000}</td>
            </tr>
            <tr>
              <td className="p-1 border-r border-gray-700">Tier</td>
              <td className="p-1 text-right">{tierInfo.tier}</td>
              <td className="p-1 border-l border-gray-700">XP to Next</td>
              <td className="p-1 text-right">{progression?.xpToNextLevel || progression?.xpNeededForNextLevel}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* User Progression */}
        <div className="lg:col-span-2">
          <div className="border border-gray-700 rounded-sm overflow-hidden">
            <div className="bg-gray-800 p-1 text-center">Your Progress</div>
            <div className="p-2 bg-gray-800">
              {progression && (
                <div>
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span>XP Progress</span>
                      <span>{progression.xpInCurrentLevel} / {progression.xpNeededForNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, progression.progressPercentage || 0)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-400 mt-0.5">
                      {progression.percentToNextLevel != null ? (typeof window !== 'undefined' ? progression.percentToNextLevel.toFixed(1) : progression.percentToNextLevel.toString()) : '0'}% to next level
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="border border-gray-600 p-1.5">
                      <h3 className="font-bold mb-1 text-center text-[10px]">Level Benefits</h3>
                      <ul className="space-y-0.5 text-[10px]">
                        <li className="flex justify-between">
                          <span>Faucet:</span>
                          <span>x{progression?.multiplier != null ? (typeof window !== 'undefined' ? progression.multiplier.toFixed(2) : progression.multiplier.toString()) : '1.00'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>PTC:</span>
                          <span>x{progression?.multiplier != null ? (typeof window !== 'undefined' ? progression.multiplier.toFixed(2) : progression.multiplier.toString()) : '1.00'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Shortlink:</span>
                          <span>x{progression?.multiplier != null ? (typeof window !== 'undefined' ? progression.multiplier.toFixed(2) : progression.multiplier.toString()) : '1.00'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Mining:</span>
                          <span>x{progression?.multiplier != null ? (typeof window !== 'undefined' ? progression.multiplier.toFixed(2) : progression.multiplier.toString()) : '1.00'}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border border-gray-600 p-1.5">
                      <h3 className="font-bold mb-1 text-center text-[10px]">Tier: {tierInfo.tier}</h3>
                      <p className="text-[10px] mb-1">
                        Next: Lv {(progression?.level || 0) + 1} x{getMultiplierTier((progression?.level || 0) + 1).multiplier}
                      </p>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400">XP needed:</div>
                        <div className="font-bold text-[10px]">{progression?.xpToNextLevel || progression?.xpNeededForNextLevel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="border border-gray-700 rounded-sm overflow-hidden">
            <div className="bg-gray-800 p-1 text-center">Top Players</div>
            <div className="p-1 bg-gray-800">
              {lbLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-1 border border-gray-600 text-[10px] ${
                        index === 0 ? 'bg-yellow-900 bg-opacity-30' :
                        index === 1 ? 'bg-gray-700' :
                        index === 2 ? 'bg-yellow-800 bg-opacity-20' : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-1.5 text-[8px] ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-yellow-700 text-white' : 'bg-gray-600 text-white'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${player.rank}`}
                          </div>
                          <div>
                            <div className="font-medium">{player.username}</div>
                            <div>L{player.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div>{player.xp}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How XP Works */}
      <div className="border border-gray-700 rounded-sm overflow-hidden mt-1">
        <div className="bg-gray-800 p-1 text-center">How XP & Multipliers Work</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
          <div className="border border-gray-600 p-1">
            <h3 className="font-bold mb-1 text-center text-[10px]">XP System</h3>
            <ul className="space-y-0.5 text-[10px]">
              <li>• Earn XP from activities</li>
              <li>• Level up with XP</li>
              <li>• Higher levels unlock features</li>
              <li>• Level n: 100×n² XP</li>
              <li>• Check leaderboard</li>
            </ul>
          </div>
          <div className="border border-gray-600 p-1">
            <h3 className="font-bold mb-1 text-center text-[10px]">Multiplier Tiers</h3>
            <ul className="space-y-0.5 text-[10px]">
              <li>• 1-5: 1.0x (base)</li>
              <li>• 6-10: 1.1x (+10%)</li>
              <li>• 11-20: 1.25x (+25%)</li>
              <li>• 21-30: 1.5x (+50%)</li>
              <li>• 31-40: 1.75x (+75%)</li>
              <li>• 41+: 2.0x (+100%)</li>
            </ul>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-1 p-1 rounded text-[10px] ${
          message.includes('Success')
            ? 'bg-green-700 text-green-100'
            : 'bg-red-700 text-red-100'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}