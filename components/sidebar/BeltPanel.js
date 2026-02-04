'use client';

import { FaFlask } from 'react-icons/fa';

const beltItems = [
    { id: 1, icon: <FaFlask className="text-red-500" />, quantity: 5 },
    { id: 2, icon: <FaFlask className="text-blue-500" />, quantity: 3 },
    { id: 3, icon: null, quantity: null },
    { id: 4, icon: null, quantity: null },
    { id: 5, icon: <FaFlask className="text-green-500" />, quantity: 1 },
];

const BeltSlot = ({ item }) => (
    <div className="aspect-square flex-1 bg-surface-700/50 rounded-md flex items-center justify-center relative">
        {item.icon && (
            <>
                <div className="text-2xl">{item.icon}</div>
                <div className="absolute bottom-1 right-1 bg-surface-900/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {item.quantity}
                </div>
            </>
        )}
    </div>
);

export default function BeltPanel() {
    return (
        <div className="p-2 bg-surface-800/60 rounded-lg">
            <div className="flex items-center gap-2">
                {beltItems.map(item => (
                    <BeltSlot key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
