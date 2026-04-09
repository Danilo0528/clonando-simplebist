'use client';

import { useState } from 'react';
import { FaPlusCircle, FaBullhorn, FaCrown, FaGift, FaStar, FaLink } from 'react-icons/fa';

export default function OtherPage() {
  const [activeSection, setActiveSection] = useState('all');

  const otherFeatures = [
    {
      id: 'referral',
      title: 'Referral Program',
      description: 'Invite friends and earn 20% of their earnings',
      icon: FaGift,
      color: 'green',
      status: 'Available',
      action: 'Invite Friends',
    },
    {
      id: 'affiliate',
      title: 'Affiliate Network',
      description: 'Partner with us and earn commission',
      icon: FaBullhorn,
      color: 'blue',
      status: 'Available',
      action: 'Learn More',
    },
    {
      id: 'vip',
      title: 'VIP Program',
      description: 'Exclusive benefits for top earners',
      icon: FaCrown,
      color: 'yellow',
      status: 'Coming Soon',
      action: 'Join Waitlist',
    },
    {
      id: 'daily-bonus',
      title: 'Daily Bonus',
      description: 'Login daily to claim bonus rewards',
      icon: FaStar,
      color: 'purple',
      status: 'Available',
      action: 'Claim Bonus',
    },
    {
      id: 'social',
      title: 'Social Media Rewards',
      description: 'Follow us on social media for extra rewards',
      icon: FaLink,
      color: 'pink',
      status: 'Available',
      action: 'Connect',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaPlusCircle className="text-cyan-400" />
          Other Features
        </h1>
        <p className="text-gray-400 mt-1">Explore additional ways to earn and engage</p>
      </div>

      <div className="grid gap-4">
        {otherFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getColorClasses(feature.color)}`}>
                  <Icon className="text-3xl" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(feature.color)}`}>
                      {feature.status}
                    </span>
                  </div>
                  
                  <button className={`mt-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${getColorClasses(feature.color)}`}>
                    {feature.action}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcements */}
      <div className="mt-8 bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaBullhorn className="text-yellow-400" />
          Latest Announcements
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-start gap-3">
              <FaStar className="text-yellow-400 mt-1" />
              <div>
                <h3 className="text-white font-medium mb-1">New Mining Algorithm Update</h3>
                <p className="text-sm text-gray-400">We've improved our mining system for better efficiency. Check it out!</p>
                <p className="text-xs text-gray-500 mt-2">2 days ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-green-400">
            <div className="flex items-start gap-3">
              <FaGift className="text-green-400 mt-1" />
              <div>
                <h3 className="text-white font-medium mb-1">Weekend Bonus Event</h3>
                <p className="text-sm text-gray-400">Earn 2x XP on all faucet claims this weekend!</p>
                <p className="text-xs text-gray-500 mt-2">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
