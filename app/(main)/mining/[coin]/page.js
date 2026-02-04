'use client';

import { useParams } from 'next/navigation';
import SimpleMiner from '../../../../components/SimpleMiner';
import BitcoinPoolInfo from '../../../../components/BitcoinPoolInfo';

export default function MiningCoinPage() {
  const params = useParams();
  const coin = params.coin;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-200 text-center">Mining {coin.charAt(0).toUpperCase() + coin.slice(1)}</h1>
          {coin === 'bitcoin' && (
            <div className="max-w-md mx-auto">
              <BitcoinPoolInfo />
            </div>
          )}
          <SimpleMiner coin={coin} />
        </div>
      </div>
    </div>
  );
}
