'use client';

import { FaFaucet, FaEye, FaLink, FaGem } from 'react-icons/fa';
import Link from 'next/link';

const ActionButton = ({ href, icon, label, color }) => (
    <Link href={href}>
        <div className={`bg-${color}-600 hover:bg-${color}-700 p-3 rounded-lg text-center transition-colors duration-200 cursor-pointer`}>
            <div className="flex justify-center items-center mb-1">{icon}</div>
            <div className="text-xs font-medium text-white">{label}</div>
        </div>
    </Link>
);

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <ActionButton href="/faucet" icon={<FaFaucet className="text-white text-xl" />} label="Faucet" color="blue" />
      <ActionButton href="/ptc" icon={<FaEye className="text-white text-xl" />} label="PTC" color="green" />
      <ActionButton href="/shortlinks" icon={<FaLink className="text-white text-xl" />} label="Links" color="purple" />
      <ActionButton href="/mining" icon={<FaGem className="text-white text-xl" />} label="Mining" color="yellow" />
    </div>
  );
}
