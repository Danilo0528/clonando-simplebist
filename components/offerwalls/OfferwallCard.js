'use client';

import Image from 'next/image';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';

const OfferwallCard = ({ offer }) => (
    <div 
        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 group"
    >
        <div className="relative h-36 w-full">
            <Image src={offer.image_url} alt={`${offer.name} Offerwall`} layout="fill" objectFit="cover" />
            <div className="absolute top-2 right-2 bg-gray-900/70 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <FaStar />
                <span>Popular</span>
            </div>
        </div>
        
        <div className="p-5">
            <h3 className="font-bold text-xl text-white mb-1">{offer.name}</h3>
            <p className="text-sm text-gray-400 mb-4 h-12">{offer.description}</p>

            <div className="flex justify-between items-center mb-5 text-sm">
                <span className="text-gray-300">Avg. Earnings:</span>
                <span className="font-bold text-green-400 tracking-wider">{offer.reward}</span>
            </div>

            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg text-sm transition-all duration-300 flex items-center justify-center gap-2 transform group-hover:scale-105">
                <span>Start Earning</span>
                <FaExternalLinkAlt />
            </button>
        </div>
    </div>
);

export default OfferwallCard;
