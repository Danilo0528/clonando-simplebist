'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStats } from '../../context/StatsContext';
import Cookies from 'js-cookie';
import { FaGift } from 'react-icons/fa';

const DailyReward = () => {
    const { refreshUserData } = useStats();
    const [canClaim, setCanClaim] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchRewardStatus = useCallback(async () => {
        const token = Cookies.get('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch('/api/rewards', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch reward status');
            const data = await res.json();
            
            setCanClaim(data.canClaim);
            setTimeLeft(data.timeLeft > 0 ? Math.floor(data.timeLeft / 1000) : 0);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if(isClient) fetchRewardStatus();
    }, [fetchRewardStatus, isClient]);

    useEffect(() => {
        if (!isClient || timeLeft <= 0 || canClaim) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                const nextTime = prevTime > 1 ? prevTime - 1 : 0;
                return nextTime;
            });
        }, 1000);

        if (timeLeft === 0 && !canClaim) {
            setCanClaim(true);
        }

        return () => clearInterval(timer);
    }, [timeLeft, canClaim, isClient]);

    const handleClaim = async () => {
        const token = Cookies.get('token');
        if (!token || !canClaim) return;
        try {
            const res = await fetch('/api/rewards', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to claim reward');
            
            await refreshUserData();
            await fetchRewardStatus();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatTime = (seconds) => {
        if (seconds <= 0) return '00:00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const renderContent = () => {
        if (!isClient || loading) {
            return <span className="text-xs text-gray-400">...</span>;
        }
        if (error) {
            return <span className="text-xs text-red-400">!</span>;
        }
        if (canClaim) {
            return (
                <button onClick={handleClaim} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-[10px] px-2 py-1 rounded transition-colors">
                    CLAIM
                </button>
            );
        }
        return (
             <span className="font-mono font-semibold text-white bg-gray-900/50 px-1.5 py-0.5 rounded text-[10px] tracking-tight whitespace-nowrap">
                {formatTime(timeLeft)}
            </span>
        );
    }

    return (
        <div className="px-2 pb-2">
            <div className="bg-gray-800/60 rounded-md p-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <FaGift className={`text-yellow-400 ${canClaim ? 'animate-pulse' : ''}`} size={14}/>
                    <span className="font-bold text-white text-[10px]">DAILY</span>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default DailyReward;