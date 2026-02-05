'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function ProgressionCompact() {
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch progression stats');
      const data = await response.json();
      const levelInfoResponse = await fetch('/api/user/level-info', {
        headers: { 'Authorization': `Bearer ${token}` },
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
        body: JSON.stringify({ limit: 5 }), // limit to 5 for compact view
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
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

  const getMultiplierTier = (level) => {
    if (level >= 41) return { tier: 'Elite', multiplier: 2.0, color: 'text-yellow-400' };
    if (level >= 31) return { tier: 'Diamond', multiplier: 1.75, color: 'text-blue-400' };
    if (level >= 21) return { tier: 'Platinum', multiplier: 1.5, color: 'text-gray-300' };
    if (level >= 11) return { tier: 'Gold', multiplier: 1.25, color: 'text-yellow-500' };
    if (level >= 6) return { tier: 'Silver', multiplier: 1.1, color: 'text-gray-400' };
    return { tier: 'Bronze', multiplier: 1.0, color: 'text-yellow-700' };
  };

  const tierInfo = getMultiplierTier(progression?.level || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-bold text-lg mb-2">Progression Overview</h1>
        {progression && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Progress */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="font-bold text-md mb-2">Your Progress (Level {progression.level})</h2>
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>XP Progress</span>
                  <span>{progression.xpInCurrentLevel} / {progression.xpNeededForNextLevel} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" style={{ width: `${progression.progressPercentage || 0}%` }}></div>
                </div>
                <div className="text-right text-xs text-gray-400 mt-1">
                  {progression.percentToNextLevel?.toFixed(1) || '0'}% to next level
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Multiplier:</span> <span className="font-semibold">x{progression.multiplier?.toFixed(2) || '1.00'}</span></div>
                <div className="flex justify-between"><span>Tier:</span> <span className={`font-semibold ${tierInfo.color}`}>{tierInfo.tier}</span></div>
                <div className="flex justify-between"><span>Next Level XP:</span> <span className="font-semibold">{progression.xpToNextLevel || progression.xpNeededForNextLevel}</span></div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="font-bold text-md mb-2">Top Players</h2>
                {lbLoading ? (
                    <div className="text-center py-2"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>
                ) : (
                    <div className="space-y-2">
                    {leaderboard.map((player, index) => (
                        <div key={player.id} className={`flex justify-between items-center text-sm p-2 rounded ${index === 0 ? 'bg-yellow-900/30' : 'bg-gray-700/50'}`}>
                            <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold ${ 
                                    index === 0 ? 'bg-yellow-500 text-black' : 
                                    index === 1 ? 'bg-gray-400 text-black' : 
                                    index === 2 ? 'bg-yellow-700 text-white' : 'bg-gray-600 text-white'
                                }`}>
                                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${player.rank}`}
                                </div>
                                <div>
                                    <div className="font-medium">{player.username}</div>
                                    <div className="text-xs text-gray-400">Lvl {player.level}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">{player.xp} XP</div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

       {/* How XP Works - Simplified */}
      <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="font-bold text-md mb-2 text-center">How XP & Multipliers Work</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                   <h3 className="font-bold mb-1 text-center">XP System</h3>
                   <ul className="list-disc list-inside space-y-1 text-gray-300">
                       <li>Earn XP from various activities.</li>
                       <li>Level up by accumulating XP.</li>
                       <li>Higher levels unlock greater rewards.</li>
                       <li>XP for level `n` is `100 * n^2`.</li>
                   </ul>
               </div>
               <div>
                   <h3 className="font-bold mb-1 text-center">Multiplier Tiers</h3>
                   <ul className="space-y-1 text-gray-300">
                      <li><span className="font-semibold">Lvl 1-5:</span> 1.0x (Bronze)</li>
                      <li><span className="font-semibold">Lvl 6-10:</span> 1.1x (Silver)</li>
                      <li><span className="font-semibold">Lvl 11-20:</span> 1.25x (Gold)</li>
                      <li><span className="font-semibold">Lvl 21-30:</span> 1.5x (Platinum)</li>
                      <li><span className="font-semibold">Lvl 31-40:</span> 1.75x (Diamond)</li>
                      <li><span className="font-semibold">Lvl 41+:</span> 2.0x (Elite)</li>
                   </ul>
               </div>
           </div>
       </div>

      {message && <div className={`mt-4 p-2 rounded text-sm ${message.includes('Success') ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{message}</div>}
    </div>
  );
}
