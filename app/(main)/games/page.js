'use client';

import { useState } from 'react';
import { FaGamepad, FaTrophy, FaCoins, FaUsers, FaPlay } from 'react-icons/fa';

const mockGames = [
  { id: 1, name: 'Dice Roll', description: 'Predict the dice roll and win big!', minBet: 10, maxBet: 1000, players: 142, icon: '🎲', category: 'chance' },
  { id: 2, name: 'Coin Flip', description: 'Heads or tails? Double your bet!', minBet: 5, maxBet: 500, players: 89, icon: '🪙', category: 'chance' },
  { id: 3, name: 'Mines', description: 'Avoid the mines and collect rewards!', minBet: 20, maxBet: 2000, players: 234, icon: '💣', category: 'strategy' },
  { id: 4, name: 'Crash', description: 'Cash out before it crashes!', minBet: 10, maxBet: 1500, players: 312, icon: '📈', category: 'timing' },
  { id: 5, name: 'Plinko', description: 'Drop the ball and watch it fall!', minBet: 15, maxBet: 800, players: 178, icon: '⚫', category: 'chance' },
  { id: 6, name: 'Wheel Spin', description: 'Spin the wheel for massive rewards!', minBet: 25, maxBet: 1000, players: 201, icon: '🎡', category: 'chance' },
];

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'chance', 'strategy', 'timing'];

  const filteredGames = selectedCategory === 'all'
    ? mockGames
    : mockGames.filter(game => game.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaGamepad className="text-pink-400" />
          Games
        </h1>
        <p className="text-gray-400 mt-1">Play games and multiply your earnings!</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-[#2a2c3a] text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="bg-[#2a2c3a] border border-gray-700 rounded-lg overflow-hidden hover:border-pink-500/50 transition-all group"
          >
            <div className="h-40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center relative">
              <span className="text-7xl">{game.icon}</span>
              <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
                <FaUsers />
                {game.players}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-white text-lg mb-1">{game.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{game.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-500">Min Bet:</span>
                  <div className="flex items-center gap-1">
                    <FaCoins className="text-yellow-400 text-xs" />
                    <span>{game.minBet} SBT</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-500">Max Bet:</span>
                  <div className="flex items-center gap-1">
                    <FaCoins className="text-yellow-400 text-xs" />
                    <span>{game.maxBet} SBT</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:scale-105 transform">
                <FaPlay /> Play Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1,234</p>
            <p className="text-sm text-gray-400">Total Winners Today</p>
          </div>
          <div className="text-center">
            <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">50,678</p>
            <p className="text-sm text-gray-400">SBT Won Today</p>
          </div>
          <div className="text-center">
            <FaUsers className="text-3xl text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1,156</p>
            <p className="text-sm text-gray-400">Active Players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
