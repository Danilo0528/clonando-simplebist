'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const OfferwallCard = ({ offerwall }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isSvg = offerwall.logo.endsWith('.svg');

    return (
        <div className="bg-surface-800/60 rounded-lg p-4 flex flex-col items-center justify-center text-center relative hover:bg-surface-700/80 transition-all duration-200 cursor-pointer">
            {offerwall.bonus && (
                <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-md">
                    {offerwall.bonus}
                </div>
            )}
            <div className="h-16 w-full flex items-center justify-center mb-3">
                {isSvg ? (
                    <img src={offerwall.logo} alt={`${offerwall.name} logo`} className="max-h-10 w-auto object-contain" />
                ) : (
                    <Image src={offerwall.logo} alt={`${offerwall.name} logo`} width={100} height={40} className="object-contain"/>
                )}
            </div>
            <h4 className="font-bold text-white mb-1">{offerwall.name}</h4>
            <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{offerwall.rating.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    <span>{isClient ? offerwall.users.toLocaleString() : offerwall.users}</span>
                </div>
            </div>
        </div>
    );
};

export default OfferwallCard;
