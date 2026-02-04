'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const fetchReputation = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Simulate reputation data (in a real system, this would come from an API)
      setReputation({
        score: 95,
        level: 'Trusted',
        suspiciousActivityCount: 0,
        accountAgeDays: 45,
        lastLogin: new Date().toISOString(),
        securityStatus: 'Secure'
      });
    } catch (error) {
      console.error('Error fetching reputation:', error);
      setMessage('Error loading security information');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Security Status</h2>
          
          {reputation && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="text-4xl font-bold text-green-600">
                    {reputation.score}
                  </div>
                  <div className="text-sm text-gray-600">Security Score (0-100)</div>
                </div>
                <div>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
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
                    className="h-2.5 rounded-full bg-green-600" 
                    style={{ width: `${reputation.score}%` }}
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
        
        {/* Security Measures */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Measures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Rate Limiting</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Faucet: 1 claim per hour</li>
                <li>• PTC clicks: 5 per 30 seconds</li>
                <li>• Shortlinks: 10 per minute</li>
                <li>• Withdrawals: 5 per day</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Fraud Prevention</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Suspicious activity detection</li>
                <li>• Bot prevention measures</li>
                <li>• IP-based restrictions</li>
                <li>• Account reputation system</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Security Best Practices */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Best Practices</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Use a strong, unique password for your account</li>
            <li>Never share your account credentials with others</li>
            <li>Be cautious of suspicious activities or requests</li>
            <li>Report any security concerns immediately</li>
            <li>Keep your withdrawal addresses secure</li>
            <li>Review your transaction history regularly</li>
            <li>Enable 2FA if available</li>
            <li>Only access the site from trusted devices</li>
          </ul>
        </div>
        
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-800">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}