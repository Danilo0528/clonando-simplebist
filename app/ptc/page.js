'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PtcPage() {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickLoading, setClickLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRandomAd();
  }, []);

  const fetchRandomAd = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/ptc/ad', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setMessage('No active ads available at the moment');
        } else {
          throw new Error('Failed to fetch ad');
        }
      } else {
        const data = await response.json();
        setAd(data);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
      setMessage('Error loading ad');
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async () => {
    if (!ad) {
      setMessage('No ad to click');
      return;
    }

    setClickLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/ptc/ad', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adId: ad.ad.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to click ad');
        return;
      }

      setMessage(`Success! You earned ${data.reward} tokens.`);
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
      
      // Get a new ad after successful click
      setTimeout(fetchRandomAd, 3000); // Wait 3 seconds before showing new ad
    } catch (error) {
      console.error('Error clicking ad:', error);
      setMessage('Error clicking ad');
    } finally {
      setClickLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading PTC ads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Paid To Click (PTC)</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">View Ads and Earn Tokens</h2>
          
          {ad && (
            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{ad.ad.title}</h3>
              <p className="text-gray-600 mb-4">{ad.ad.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Reward: {ad.ad.reward} tokens</span>
                <button
                  onClick={handleAdClick}
                  disabled={clickLoading}
                  className={`px-4 py-2 rounded font-medium ${
                    clickLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {clickLoading ? 'Processing...' : 'View Ad'}
                </button>
              </div>
            </div>
          )}
          
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>View ads for a few seconds to earn tokens</li>
            <li>Earn {ad?.config?.rewardPerClick} tokens per valid ad view</li>
            <li>Rate limited to prevent abuse</li>
            <li>Max {ad?.config?.maxClicksPerWindow} clicks per {Math.floor(ad?.config?.rateLimitWindow / 1000)} seconds</li>
            <li>Tokens can be converted to bound tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );
}