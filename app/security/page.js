'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchReputation();
  }, []);

  const fetchReputation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/security/reputation', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch security information');
      }

      const data = await response.json();
      setReputation(data.reputation);
    } catch (error) {
      console.error('Error fetching reputation:', error);
      setMessage('Error loading security information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading security information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Security & Safety</h1>
        
        {/* Reputation Score */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Reputation</h2>
          
          {reputation && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="text-4xl font-bold" style={{ color: reputation.score > 80 ? '#10b981' : reputation.score > 60 ? '#f59e0b' : '#ef4444' }}>
                    {reputation.score}
                  </div>
                  <div className="text-sm text-gray-600">Score (0-100)</div>
                </div>
                <div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reputation.level === 'Trusted' ? 'bg-green-100 text-green-800' :
                    reputation.level === 'Standard' ? 'bg-blue-100 text-blue-800' :
                    reputation.level === 'Caution' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reputation.level}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Account age: {reputation.accountAgeDays} days
                  </div>
                  <div className="text-sm text-gray-600">
                    Suspicious activities: {reputation.suspiciousActivityCount}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ 
                      width: `${reputation.score}%`, 
                      backgroundColor: reputation.score > 80 ? '#10b981' : reputation.score > 60 ? '#f59e0b' : '#ef4444' 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Low Risk</span>
                  <span>Medium Risk</span>
                  <span>High Risk</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Security Tips */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Best Practices</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Use a strong, unique password for your account</li>
            <li>Never share your account credentials with others</li>
            <li>Be cautious of suspicious activities or requests</li>
            <li>Report any security concerns immediately</li>
            <li>Keep your withdrawal addresses secure</li>
            <li>Review your transaction history regularly</li>
          </ul>
        </div>
        
        {/* Rate Limits */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rate Limits</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Limit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Window
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Faucet Claim
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 per hour
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 hour
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Prevent excessive claims
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    PTC Clicks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 per 30 sec
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    30 seconds
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Prevent bot activity
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Shortlink Visit
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    10 per minute
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 minute
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Prevent manipulation
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Withdrawal Requests
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 per day
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    24 hours
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Prevent abuse
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* How Security Works */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How Our Security System Works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>We monitor all activities for suspicious patterns</li>
            <li>Rate limits prevent automated abuse</li>
            <li>Account reputation is calculated based on behavior</li>
            <li>Suspicious activities are logged and reviewed</li>
            <li>Security measures protect all users from fraud</li>
            <li>Your personal information is encrypted and secure</li>
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