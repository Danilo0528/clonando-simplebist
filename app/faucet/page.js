'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FaucetPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchFaucetStatus();
  }, []);

  const fetchFaucetStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/faucet/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch faucet status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching faucet status:', error);
      setMessage('Error loading faucet status');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!status?.canClaim) {
      setMessage(`Cannot claim yet. Please wait.`);
      return;
    }

    setClaimLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/faucet/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to claim faucet');
        return;
      }

      setMessage(`Success! You claimed ${data.rewardAmount} tokens.`);
      fetchFaucetStatus(); // Refresh status
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (error) {
      console.error('Error claiming faucet:', error);
      setMessage('Error claiming faucet');
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading faucet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Faucet</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Claim Free Tokens</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Earn free tokens by claiming the faucet periodically.</p>
            <p className="text-gray-600">Reward: {status?.config?.rewardAmount} tokens every {Math.floor(status?.config?.interval / (60*60*1000))} hour(s)</p>
          </div>
          
          {status && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <p className={`font-medium ${status.canClaim ? 'text-green-600' : 'text-red-600'}`}>
                    {status.canClaim ? 'Ready to claim!' : 'Waiting period...'}
                  </p>
                </div>
                
                {!status.canClaim && status.timeRemaining > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time remaining:</p>
                    <p className="font-medium">
                      {Math.floor(status.timeRemaining / 60)}m {status.timeRemaining % 60}s
                    </p>
                  </div>
                )}
              </div>
              
              {status.lastClaim && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Last claimed:</p>
                  <p className="font-medium">{new Date(status.lastClaim).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleClaim}
            disabled={!status?.canClaim || claimLoading}
            className={`px-6 py-3 rounded-lg font-medium ${
              status?.canClaim && !claimLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {claimLoading ? 'Claiming...' : status?.canClaim ? 'Claim Faucet' : 'Wait for next claim'}
          </button>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Claim free tokens every hour</li>
            <li>Earn {status?.config?.rewardAmount} tokens per claim</li>
            <li>Tokens can be converted to bound tokens</li>
            <li>Bound tokens can be withdrawn as cryptocurrency</li>
          </ul>
        </div>
      </div>
    </div>
  );
}