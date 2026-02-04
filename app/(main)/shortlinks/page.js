'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const shortlinksData = [
  {
    name: 'Earnow.Online',
    tokens: 14,
    exp: 25,
    timer: '24 Hours',
    claims: '0/8',
  },
  {
    name: 'Shortano.Link',
    tokens: 10,
    exp: 25,
    timer: '24 Hours',
    claims: '5/8',
  },
  {
    name: 'Simple SL',
    tokens: 3,
    exp: 25,
    timer: '1 Hours',
    claims: '0/8',
  },
    {
    name: 'mqnet',
    tokens: 2,
    exp: 25,
    timer: '24 Hours',
    claims: '4/8',
  },
  {
    name: 'Exe.io',
    tokens: 1.5,
    exp: 25,
    timer: '24 Hours',
    claims: '1/8',
  },
    {
    name: 'ShrinkEarn',
    tokens: 1.5,
    exp: 25,
    timer: '24 Hours',
    claims: '0/8',
  },
];

export default function ShortlinksPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="flex-grow flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Shortlinks</h1>
          <div className="text-xs text-gray-400">
            <span>Dashboard</span> / <span>Shortlinks</span>
          </div>
        </div>

        <div className="space-y-3">
          {shortlinksData.map((link, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{link.name}</h3>
                <div className="flex items-center text-xs space-x-3 mt-1 text-gray-400">
                  <span>{link.tokens} Tokens</span>
                  <span>{link.exp} Exp</span>
                  <span>{link.timer}</span>
                  <span>{link.claims} Claims</span>
                </div>
              </div>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-4 rounded text-sm">
                VISIT
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
