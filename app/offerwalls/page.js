'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchOfferwalls();
  }, []);

  const fetchOfferwalls = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/offerwalls', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch offerwalls');
      }

      const data = await response.json();
      setOfferwalls(data.offerwalls);
      setHistory(data.history);
      setConfig(data.config);
    } catch (error) {
      console.error('Error fetching offerwalls:', error);
      setMessage('Error loading offerwalls');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading offerwalls...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Offerwalls</h1>
        
        {/* Active Offerwalls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Offers</h2>
          
          {offerwalls.length === 0 ? (
            <p className="text-gray-600">No active offerwalls available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offerwalls.map((offerwall) => (
                <div key={offerwall.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-900">{offerwall.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{offerwall.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-green-600 font-medium">+{offerwall.reward} tokens</span>
                    <button 
                      onClick={() => window.open(`https://www.${offerwall.id.replace(/([A-Z])/g, '-$1').toLowerCase()}.com`, '_blank')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Browse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Offer History */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Completions</h2>
          
          {history.length === 0 ? (
            <p className="text-gray-600">No completed offers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reward
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.provider}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {record.offerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        +{record.reward} tokens
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* How Offerwalls Work */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How Offerwalls Work</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Complete offers from our partner networks to earn tokens</li>
            <li>Offers may include surveys, app downloads, registrations, etc.</li>
            <li>Rewards are automatically credited to your account</li>
            <li>Each provider has different types of offers available</li>
            <li>Be sure to complete offers fully to receive rewards</li>
            <li>Rewards typically range from 0.01 to 0.02 tokens per offer</li>
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