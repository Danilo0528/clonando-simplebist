'use client';

import { useState, useEffect } from 'react';
import { useStats } from '../../../context/StatsContext';
import { FaTrophy, FaStar, FaCheck, FaLock } from 'react-icons/fa';

const challenges = [
  { id: 1, title: 'Complete 10 Faucet Claims', description: 'Claim from the faucet 10 times', reward: 50, xp: 100, type: 'faucet', required: 10 },
  { id: 2, title: 'First Mining Session', description: 'Start your first mining session', reward: 100, xp: 200, type: 'mining', required: 1 },
  { id: 3, title: 'Watch 5 PTC Ads', description: 'View 5 paid-to-click advertisements', reward: 75, xp: 150, type: 'ptc', required: 5 },
  { id: 4, title: 'Reach Level 5', description: 'Progress to level 5', reward: 200, xp: 500, type: 'level', required: 5 },
  { id: 5, title: 'Complete an Offerwall', description: 'Finish your first offerwall task', reward: 150, xp: 300, type: 'offerwall', required: 1 },
  { id: 6, title: 'Submit a Withdrawal', description: 'Make your first withdrawal request', reward: 100, xp: 250, type: 'withdrawal', required: 1 },
];

export default function ChallengesPage() {
  const { userData } = useStats();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load completed challenges from localStorage or API
    const loadChallenges = async () => {
      try {
        const stored = localStorage.getItem('completedChallenges');
        if (stored) {
          setCompletedChallenges(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const isCompleted = (challengeId) => completedChallenges.includes(challengeId);

  const getProgress = (challenge) => {
    if (!userData) return 0;
    
    switch (challenge.type) {
      case 'faucet':
        return Math.min((userData.faucetClaims || 0) / challenge.required * 100, 100);
      case 'level':
        return Math.min((userData.levelInfo?.level || 1) / challenge.required * 100, 100);
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaTrophy className="text-yellow-400" />
          Challenges
        </h1>
        <p className="text-gray-400 mt-1">Complete challenges to earn rewards and level up faster</p>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => {
          const completed = isCompleted(challenge.id);
          const progress = getProgress(challenge);

          return (
            <div
              key={challenge.id}
              className={`bg-[#2a2c3a] border rounded-lg p-4 transition-all ${
                completed ? 'border-green-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                    {completed ? (
                      <FaCheck className="text-green-400" />
                    ) : (
                      <FaLock className="text-gray-500 text-xs" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-yellow-400">{challenge.reward} SBT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-blue-400" />
                      <span className="text-blue-400">{challenge.xp} XP</span>
                    </div>
                  </div>

                  {!completed && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-12">
          <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No challenges available yet</p>
        </div>
      )}
    </div>
  );
}
