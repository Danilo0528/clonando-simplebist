'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProgressionPage() {
  const [progression, setProgression] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProgression();
    fetchLeaderboard();
  }, []);

  const fetchProgression = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
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
      setProgression(data.progression);
    } catch (error) {
      console.error('Error fetching progression:', error);
      setMessage('Error loading progression stats');
    }
  };

  const fetchLeaderboard = async () => {
    setLbLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
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
      setLoading(false);
      setLbLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading progression...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Progression</h1>
        
        {/* User Progression */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          
          {progression && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="text-2xl font-bold text-blue-600">{progression.level}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total XP</p>
                  <p className="text-2xl font-bold text-green-600">{progression.totalXp}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600">Next Level</p>
                  <p className="text-2xl font-bold text-yellow-600">{progression.nextLevel}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>XP Progress</span>
                  <span>{progression.xpInCurrentLevel} / {progression.xpNeededForNextLevel}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ width: `${Math.min(100, progression.progressPercentage)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Level Progression</h3>
                <p className="text-gray-600">Each level requires more XP than the last. XP is earned by participating in various activities.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Leaderboard */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Players</h2>
          
          {lbLoading ? (
            <p>Loading leaderboard...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((player) => (
                    <tr key={player.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          player.rank === 1 ? 'text-yellow-500' : 
                          player.rank === 2 ? 'text-gray-400' : 
                          player.rank === 3 ? 'text-yellow-800' : 'text-gray-900'
                        }`}>
                          #{player.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{player.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{player.level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.xp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* How XP Works */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How XP Works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Earn XP by participating in activities (faucet, PTC, shortlinks, mining)</li>
            <li>Level up by accumulating enough XP</li>
            <li>Higher levels unlock new features and benefits</li>
            <li>XP formula: Level n requires 100 × n² XP</li>
            <li>Check the leaderboard to see top players</li>
          </ul>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}