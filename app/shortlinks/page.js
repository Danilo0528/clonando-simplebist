'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShortlinksPage() {
  const [shortlinks, setShortlinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createUrl, setCreateUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUserShortlinks();
  }, []);

  const fetchUserShortlinks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/shortlinks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shortlinks');
      }

      const data = await response.json();
      setShortlinks(data.shortlinks);
    } catch (error) {
      console.error('Error fetching shortlinks:', error);
      setMessage('Error loading shortlinks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShortlink = async (e) => {
    e.preventDefault();
    
    if (!createUrl.trim()) {
      setMessage('Please enter a URL');
      return;
    }

    setCreating(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/shortlinks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: createUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to create shortlink');
        return;
      }

      setMessage('Shortlink created successfully!');
      setCreateUrl('');
      fetchUserShortlinks(); // Refresh the list
    } catch (error) {
      console.error('Error creating shortlink:', error);
      setMessage('Error creating shortlink');
    } finally {
      setCreating(false);
    }
  };

  const handleVisitShortlink = async (code) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/shortlinks/visit/${code}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to visit shortlink');
        return;
      }

      setMessage(`Success! You earned ${data.reward} tokens.`);
      
      // Update balances in dashboard by triggering a refresh event
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (error) {
      console.error('Error visiting shortlink:', error);
      setMessage('Error visiting shortlink');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading shortlinks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shortlinks</h1>
        
        {/* Create Shortlink Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Shortlink</h2>
          
          <form onSubmit={handleCreateShortlink} className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              value={createUrl}
              onChange={(e) => setCreateUrl(e.target.value)}
              placeholder="Enter URL to shorten..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className={`px-6 py-2 rounded-lg font-medium ${
                creating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {creating ? 'Creating...' : 'Create Shortlink'}
            </button>
          </form>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Earn {0.002} tokens for each visit to your shortlinks!</p>
          </div>
        </div>
        
        {/* My Shortlinks Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Shortlinks</h2>
          
          {shortlinks.length === 0 ? (
            <p className="text-gray-600">You haven't created any shortlinks yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shortlinks.map((link) => (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{link.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 truncate max-w-xs">{link.originalUrl}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{link.visits}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/api/shortlinks/visit/${link.code}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleVisitShortlink(link.code)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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