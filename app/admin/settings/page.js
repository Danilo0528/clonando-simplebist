'use client';

import { useState } from 'react';
import { FaSave, FaCog } from 'react-icons/fa';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    faucetCooldown: 3600,
    faucetReward: 10,
    dailyRewardAmount: 100,
    withdrawalFee: 2,
    minWithdrawalBTC: 0.001,
    registrationEnabled: true,
    faucetEnabled: true,
  });

  const handleSave = async () => {
    // TODO: Save settings to database
    alert('Settings saved successfully! (Note: Implement API endpoint to save settings)');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <button
          onClick={handleSave}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FaSave /> Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {/* Faucet Settings */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Faucet Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Faucet Cooldown (seconds)</label>
              <input
                type="number"
                value={settings.faucetCooldown}
                onChange={(e) => setSettings({ ...settings, faucetCooldown: parseInt(e.target.value) })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Faucet Reward Amount</label>
              <input
                type="number"
                value={settings.faucetReward}
                onChange={(e) => setSettings({ ...settings, faucetReward: parseInt(e.target.value) })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Enable Faucet</label>
              <input
                type="checkbox"
                checked={settings.faucetEnabled}
                onChange={(e) => setSettings({ ...settings, faucetEnabled: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Reward Settings */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Reward Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Daily Reward Amount</label>
              <input
                type="number"
                value={settings.dailyRewardAmount}
                onChange={(e) => setSettings({ ...settings, dailyRewardAmount: parseInt(e.target.value) })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Withdrawal Settings */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Withdrawal Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Withdrawal Fee (%)</label>
              <input
                type="number"
                value={settings.withdrawalFee}
                onChange={(e) => setSettings({ ...settings, withdrawalFee: parseInt(e.target.value) })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Minimum BTC Withdrawal</label>
              <input
                type="number"
                step="0.0001"
                value={settings.minWithdrawalBTC}
                onChange={(e) => setSettings({ ...settings, minWithdrawalBTC: parseFloat(e.target.value) })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Enable Registration</label>
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
