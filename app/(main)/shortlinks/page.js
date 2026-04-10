'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ShortlinkCard = ({ shortlink, onVisit, visiting, visitProgress }) => {
    const isVisiting = visiting === shortlink.id;
    const progress = visitProgress || 0;

    return (
        <div className="bg-[#252736] rounded-lg p-4 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-base text-white">{shortlink.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{shortlink.description}</p>
                <div className="flex items-center text-xs space-x-3 mt-2 text-gray-400">
                    <span className="text-yellow-400">{shortlink.reward?.toFixed(4)} Tokens</span>
                    <span>•</span>
                    <span>{Math.floor(shortlink.reward * 1000)} Exp</span>
                    <span>•</span>
                    <span>{shortlink.visitTime}s timer</span>
                </div>
            </div>
            <button 
                onClick={() => onVisit(shortlink.id)}
                disabled={isVisiting}
                className={`${
                    isVisiting 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-yellow-500 hover:bg-yellow-600'
                } text-black font-bold py-2 px-6 rounded text-sm transition-colors duration-200 min-w-[100px]`}
            >
                {isVisiting ? `${Math.floor(progress)}%` : 'VISIT'}
            </button>
        </div>
    );
};

export default function ShortlinksPage() {
    const [shortlinks, setShortlinks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visiting, setVisiting] = useState(null);
    const [visitProgress, setVisitProgress] = useState(0);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const fetchShortlinks = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const [linksRes, statsRes] = await Promise.all([
                fetch('/api/shortlinks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/shortlinks?action=stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!linksRes.ok || !statsRes.ok) {
                throw new Error('Failed to fetch shortlinks');
            }

            const linksData = await linksRes.json();
            const statsData = await statsRes.json();

            setShortlinks(linksData.shortlinks);
            setStats(statsData.stats);
        } catch (error) {
            console.error('Error fetching shortlinks:', error);
            setMessage('Error loading shortlinks');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchShortlinks();
    }, [fetchShortlinks]);

    const handleVisit = async (shortlinkId) => {
        if (visiting) return;

        setVisiting(shortlinkId);
        setVisitProgress(0);
        setMessage('');

        const shortlink = shortlinks.find(s => s.id === shortlinkId);
        if (!shortlink) return;

        // Simulate visiting with timer
        const duration = shortlink.visitTime * 1000;
        const interval = 100;
        let elapsed = 0;

        const progressInterval = setInterval(() => {
            elapsed += interval;
            const progress = (elapsed / duration) * 100;
            setVisitProgress(progress);

            if (elapsed >= duration) {
                clearInterval(progressInterval);
            }
        }, interval);

        // Wait for the visit duration
        await new Promise(resolve => setTimeout(resolve, duration));

        // Complete the shortlink
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/shortlinks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ shortlinkId })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Failed to complete shortlink');
            } else {
                setMessage(`✅ ${data.message}`);
                await fetchShortlinks();
            }
        } catch (error) {
            console.error('Error completing shortlink:', error);
            setMessage('Error completing shortlink');
        } finally {
            setVisiting(null);
            setVisitProgress(0);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="text-xl text-white">Loading shortlinks...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Shortlinks</h1>
                    {stats && (
                        <div className="text-sm text-gray-400">
                            Today: <span className="text-yellow-400">{stats.todayEarnings?.toFixed(4)}</span> tokens | 
                            Completed: <span className="text-blue-400">{stats.totalCompleted}</span>
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`p-3 rounded-lg mb-4 ${
                        message.includes('✅') || message.includes('successfully') 
                            ? 'bg-green-900/30 text-green-300 border border-green-700' 
                            : 'bg-red-900/30 text-red-300 border border-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="space-y-3">
                    {shortlinks.length === 0 ? (
                        <div className="bg-[#252736] rounded-lg p-8 text-center text-gray-400">
                            No shortlinks available. Check back later!
                        </div>
                    ) : (
                        shortlinks.map((link) => (
                            <ShortlinkCard
                                key={link.id}
                                shortlink={link}
                                onVisit={handleVisit}
                                visiting={visiting}
                                visitProgress={visiting === link.id ? visitProgress : 0}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
