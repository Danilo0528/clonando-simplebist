'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCoins, FaStar, FaClock, FaWindowMaximize, FaMobileAlt, FaNewspaper } from 'react-icons/fa';

const StatsBar = ({ stats }) => (
    <div className="bg-[#252736] rounded-lg p-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400">Available PTC</p>
                    <p className="text-lg font-bold text-white">{stats?.availableTasks || stats?.tasks?.length || 0}</p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400">Total Tokens</p>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                        <FaCoins className="text-yellow-400" /> {stats?.todayEarnings?.toFixed(4) || '0.0000'}
                    </p>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400">Tasks Completed</p>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                        <FaStar className="text-blue-400" /> {stats?.totalTasksCompleted || 0}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const PTCAdCard = ({ ad, onView, viewing, viewProgress }) => {
    const isViewing = viewing === ad.id;
    const progress = viewProgress || 0;
    
    return (
        <div className="bg-[#252736] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between mb-3 gap-4">
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-white flex items-center gap-2"> 
                    <FaNewspaper className='text-green-400'/> {ad.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3">{ad.description}</p>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        <FaStar /> {Math.floor(ad.reward * 100)} Exp
                    </span>
                    <span className="flex items-center gap-1 bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full">
                        <FaClock /> {ad.estimatedTime} Seconds
                    </span>
                    <span className="flex items-center gap-1 bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full">
                        <FaWindowMaximize />
                    </span>
                    <span className="flex items-center gap-1 bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full">
                        <FaMobileAlt />
                    </span>
                </div>
            </div>
            <div className="flex-shrink-0 text-center md:text-right">
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-yellow-400">
                    <span className="text-xs">&#9679;</span> {ad.reward?.toFixed(4)}
                </p>
                <button 
                    onClick={() => onView(ad.id)}
                    disabled={isViewing}
                    className={`${
                        isViewing 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-black font-bold py-2 px-5 rounded-md text-sm mt-1 transition-colors duration-200`}
                >
                    {isViewing ? `Watching... ${Math.floor(progress)}%` : 'VIEW'}
                </button>
            </div>
        </div>
    );
};

export default function PTCPage() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState(null);
    const [viewProgress, setViewProgress] = useState(0);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const fetchPTCData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const [tasksRes, statsRes] = await Promise.all([
                fetch('/api/ptc', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/ptc?action=stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!tasksRes.ok || !statsRes.ok) {
                throw new Error('Failed to fetch PTC data');
            }

            const tasksData = await tasksRes.json();
            const statsData = await statsRes.json();

            setTasks(tasksData.tasks);
            setStats(statsData.stats);
        } catch (error) {
            console.error('Error fetching PTC data:', error);
            setMessage('Error loading PTC tasks');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchPTCData();
    }, [fetchPTCData]);

    const handleViewAd = async (taskId) => {
        if (viewing) return;

        setViewing(taskId);
        setViewProgress(0);
        setMessage('');

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Simulate watching the ad with progress
        const duration = task.estimatedTime * 1000; // Convert to milliseconds
        const interval = 100; // Update every 100ms
        let elapsed = 0;

        const progressInterval = setInterval(() => {
            elapsed += interval;
            const progress = (elapsed / duration) * 100;
            setViewProgress(progress);

            if (elapsed >= duration) {
                clearInterval(progressInterval);
            }
        }, interval);

        // Wait for the ad duration
        await new Promise(resolve => setTimeout(resolve, duration));

        // Complete the task
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ptc', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Failed to complete task');
            } else {
                setMessage(`✅ ${data.message}`);
                // Refresh data
                await fetchPTCData();
            }
        } catch (error) {
            console.error('Error completing PTC task:', error);
            setMessage('Error completing task');
        } finally {
            setViewing(null);
            setViewProgress(0);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1c23]">
                <div className="text-xl text-white">Loading PTC tasks...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <StatsBar stats={stats} />
            
            {message && (
                <div className={`p-3 rounded-lg mb-4 ${
                    message.includes('✅') || message.includes('successfully') 
                        ? 'bg-green-900/30 text-green-300 border border-green-700' 
                        : 'bg-red-900/30 text-red-300 border border-red-700'
                }`}>
                    {message}
                </div>
            )}

            <div>
                {tasks.length === 0 ? (
                    <div className="bg-[#252736] rounded-lg p-8 text-center text-gray-400">
                        No PTC tasks available. Check back later!
                    </div>
                ) : (
                    tasks.map((task) => (
                        <PTCAdCard 
                            key={task.id} 
                            ad={task} 
                            onView={handleViewAd}
                            viewing={viewing}
                            viewProgress={viewing === task.id ? viewProgress : 0}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
