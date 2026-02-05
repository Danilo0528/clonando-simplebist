'use client';

import { useState } from 'react';
import BitcoinPoolInfo from '../../../components/BitcoinPoolInfo';
import SimpleMiner from '../../../components/SimpleMiner';
import MiningCompact from '../../../components/mining/MiningCompact';

export default function MiningPage() {
    const [selectedCoin, setSelectedCoin] = useState(null);

    const handleSelectCoin = (coin) => {
        setSelectedCoin(coin);
    };

    const handleBack = () => {
        setSelectedCoin(null);
    };

    if (selectedCoin) {
        return (
            <div className="p-4 flex flex-col items-center justify-center">
                <BitcoinPoolInfo coin={selectedCoin} onBack={handleBack} />
                <SimpleMiner />
            </div>
        );
    }

    return (
        <div className="p-4">
            <MiningCompact onSelectCoin={handleSelectCoin} />
        </div>
    );
}
