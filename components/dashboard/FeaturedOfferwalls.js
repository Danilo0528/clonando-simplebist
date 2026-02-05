'use client';

import { FaStar } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const OfferwallCard = ({ name, rating, bonus }) => (
  <div className="bg-gray-700/50 p-3 rounded-lg">
    <div className="font-bold text-xs text-center mb-2 text-white">{name}</div>
    <div className="text-center text-yellow-400 text-sm mb-2 flex justify-center">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-500'} />
      ))}
    </div>
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded text-xs transition-colors">
      +{bonus}% Bonus
    </button>
  </div>
);

export default function FeaturedOfferwalls() {
  const [offerwalls, setOfferwalls] = useState([]);

  useEffect(() => {
    const fetchOfferwalls = async () => {
      try {
        const response = await fetch('/api/offerwalls');
        const data = await response.json();
        setOfferwalls(data);
      } catch (error) {
        console.error('Error fetching offerwalls:', error);
      }
    };

    fetchOfferwalls();
  }, []);

  return (
    <div className="bg-[#252736] p-4 rounded-lg">
      <h3 className="font-bold text-sm mb-3 flex items-center text-yellow-400">
        <FaStar className="mr-2" /> Featured Offerwalls
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {offerwalls.map((offer, i) => (
          <OfferwallCard key={i} {...offer} />
        ))}
      </div>
    </div>
  );
}
