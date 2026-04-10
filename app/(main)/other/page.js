'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlusCircle, FaBullhorn, FaCrown, FaGift, FaStar, FaLink, FaInfoCircle, FaExclamationTriangle, FaMegaphone } from 'react-icons/fa';

const typeIcons = {
    info: FaInfoCircle,
    update: FaStar,
    event: FaGift,
    warning: FaExclamationTriangle,
};

const typeColors = {
    info: 'border-blue-400 bg-blue-500/10',
    update: 'border-green-400 bg-green-500/10',
    event: 'border-yellow-400 bg-yellow-500/10',
    warning: 'border-red-400 bg-red-500/10',
};

export default function OtherPage() {
    const [activeSection, setActiveSection] = useState('all');
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const otherFeatures = [
        {
            id: 'referral',
            title: 'Referral Program',
            description: 'Invite friends and earn 20% of their earnings',
            icon: FaGift,
            color: 'green',
            status: 'Available',
            action: 'Invite Friends',
        },
        {
            id: 'affiliate',
            title: 'Affiliate Network',
            description: 'Partner with us and earn commission',
            icon: FaBullhorn,
            color: 'blue',
            status: 'Available',
            action: 'Learn More',
        },
        {
            id: 'vip',
            title: 'VIP Program',
            description: 'Exclusive benefits for top earners',
            icon: FaCrown,
            color: 'yellow',
            status: 'Coming Soon',
            action: 'Join Waitlist',
        },
        {
            id: 'daily-bonus',
            title: 'Daily Bonus',
            description: 'Login daily to claim bonus rewards',
            icon: FaStar,
            color: 'purple',
            status: 'Available',
            action: 'Claim Bonus',
        },
        {
            id: 'social',
            title: 'Social Media Rewards',
            description: 'Follow us on social media for extra rewards',
            icon: FaLink,
            color: 'pink',
            status: 'Available',
            action: 'Connect',
        },
    ];

    const fetchAnnouncements = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('/api/announcements', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch announcements');
            }

            const data = await response.json();
            setAnnouncements(data.announcements || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const getColorClasses = (color) => {
        const colors = {
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        };
        return colors[color] || colors.blue;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaPlusCircle className="text-cyan-400" />
                    Other Features
                </h1>
                <p className="text-gray-400 mt-1">Explore additional ways to earn and engage</p>
            </div>

            <div className="grid gap-4">
                {otherFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={feature.id}
                            className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getColorClasses(feature.color)}`}>
                                    <Icon className="text-3xl" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                                            <p className="text-sm text-gray-400">{feature.description}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(feature.color)}`}>
                                            {feature.status}
                                        </span>
                                    </div>

                                    <button className={`mt-3 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${getColorClasses(feature.color)}`}>
                                        {feature.action}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Announcements - Fetched from API */}
            <div className="mt-8 bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaBullhorn className="text-yellow-400" />
                    Latest Announcements
                </h2>
                
                {loading ? (
                    <div className="text-center py-8 text-gray-400">
                        Loading announcements...
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <FaMegaphone className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No announcements at this time</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => {
                            const TypeIcon = typeIcons[announcement.type] || FaInfoCircle;
                            const colorClass = typeColors[announcement.type] || typeColors.info;
                            
                            return (
                                <div 
                                    key={announcement.id} 
                                    className={`p-4 rounded-lg border-l-4 ${colorClass}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <TypeIcon className="mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-white font-medium">{announcement.title}</h3>
                                                {announcement.priority > 5 && (
                                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                                                        Priority
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">{announcement.content}</p>
                                            <p className="text-xs text-gray-500 mt-2">{formatDate(announcement.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
