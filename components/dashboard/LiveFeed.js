'use client';

import { FaFire, FaUserFriends } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const FeedItem = ({ user, earnings, action }) => (
    <div className="bg-gray-700/50 p-2 rounded-lg text-center">
        <div className="text-xs font-medium text-white truncate">{user}</div>
        <div className="text-green-400 text-sm font-bold mt-1">+{typeof window !== 'undefined' ? earnings.toFixed(2) : earnings.toString()}</div>
        <div className="text-xs text-gray-400 mt-1">{action}</div>
    </div>
);

export default function LiveFeed() {
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        const formattedData = data.map(event => ({
          user: event.user.username,
          earnings: event.amount,
          action: 'Just earned',
        }));
        setFeedItems(formattedData);
      } catch (error) {
        console.error('Error fetching live feed:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="bg-[#252736] p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm flex items-center text-pink-400">
            <FaUserFriends className="mr-2" /> Live Feed
          </h3>
          <span className="text-xs text-pink-400 flex items-center"><FaFire className="mr-1" /> LIVE</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {feedItems.map((item, i) => (
            <FeedItem key={i} {...item} />
          ))}
        </div>
      </div>
  );
}
