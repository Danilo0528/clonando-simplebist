'use client';

import { FaFire, FaUserFriends } from 'react-icons/fa';

const feedItems = [
    { user: 'Kirito0528', earnings: 5.25, action: 'Just earned' },
    { user: 'Player_Two', earnings: 3.80, action: 'Just earned' },
    { user: 'User_Three', earnings: 10.10, action: 'Just earned' },
    { user: 'AnotherUser', earnings: 2.50, action: 'Just earned' },
    { user: 'Newbie', earnings: 1.00, action: 'Just earned' },
    { user: 'ProGamer', earnings: 15.00, action: 'Just earned' },
];

const FeedItem = ({ user, earnings, action }) => (
    <div className="bg-gray-700/50 p-2 rounded-lg text-center">
        <div className="text-xs font-medium text-white truncate">{user}</div>
        <div className="text-green-400 text-sm font-bold mt-1">+{typeof window !== 'undefined' ? earnings.toFixed(2) : earnings.toString()}</div>
        <div className="text-xs text-gray-400 mt-1">{action}</div>
    </div>
);

export default function LiveFeed() {
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
