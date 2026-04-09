'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaCog, FaCheck } from 'react-icons/fa';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load settings');

      const data = await res.json();
      
      // Convert settings map to editable format
      const editableSettings = {};
      Object.entries(data).forEach(([key, { value, category }]) => {
        editableSettings[key] = value;
      });

      // Set default values if not exist
      const defaultSettings = {
        faucet_cooldown: '3600',
        faucet_reward: '10',
        daily_reward_amount: '100',
        withdrawal_fee: '2',
        min_withdrawal_btc: '0.001',
        registration_enabled: 'true',
        faucet_enabled: 'true',
        site_name: 'SimpleBits Clone',
        site_description: 'Crypto Faucet Platform',
      };

      Object.entries(defaultSettings).forEach(([key, value]) => {
        if (!editableSettings[key]) {
          editableSettings[key] = value;
        }
      });

      setSettings(editableSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Initialize with defaults
      setSettings({
        faucet_cooldown: '3600',
        faucet_reward: '10',
        daily_reward_amount: '100',
        withdrawal_fee: '2',
        min_withdrawal_btc: '0.001',
        registration_enabled: 'true',
        faucet_enabled: 'true',
        site_name: 'SimpleBits Clone',
        site_description: 'Crypto Faucet Platform',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Convert settings to format expected by API
      const settingsToSave = {
        faucet_cooldown: { value: settings.faucet_cooldown, category: 'faucet' },
        faucet_reward: { value: settings.faucet_reward, category: 'faucet' },
        daily_reward_amount: { value: settings.daily_reward_amount, category: 'rewards' },
        withdrawal_fee: { value: settings.withdrawal_fee, category: 'withdrawal' },
        min_withdrawal_btc: { value: settings.min_withdrawal_btc, category: 'withdrawal' },
        registration_enabled: { value: settings.registration_enabled, category: 'general' },
        faucet_enabled: { value: settings.faucet_enabled, category: 'faucet' },
        site_name: { value: settings.site_name, category: 'general' },
        site_description: { value: settings.site_description, category: 'general' },
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaCog className="text-gray-400" />
            System Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure your platform settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.includes('success') 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          <FaCheck />
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => updateSetting('site_name', e.target.value)}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site Description</label>
              <textarea
                value={settings.site_description}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                rows="2"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Enable Registration</label>
              <select
                value={settings.registration_enabled}
                onChange={(e) => updateSetting('registration_enabled', e.target.value)}
                className="bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Faucet Settings */}
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Faucet Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Enable Faucet</label>
              <select
                value={settings.faucet_enabled}
                onChange={(e) => updateSetting('faucet_enabled', e.target.value)}
                className="bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Faucet Cooldown (seconds)</label>
              <input
                type="number"
                value={settings.faucet_cooldown}
                onChange={(e) => updateSetting('faucet_cooldown', e.target.value)}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Time between faucet claims (default: 3600 = 1 hour)</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Faucet Reward Amount</label>
              <input
                type="number"
                step="0.01"
                value={settings.faucet_reward}
                onChange={(e) => updateSetting('faucet_reward', e.target.value)}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
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
                step="0.01"
                value={settings.daily_reward_amount}
                onChange={(e) => updateSetting('daily_reward_amount', e.target.value)}
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
                step="0.1"
                value={settings.withdrawal_fee}
                onChange={(e) => updateSetting('withdrawal_fee', e.target.value)}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Minimum BTC Withdrawal</label>
              <input
                type="number"
                step="0.0001"
                value={settings.min_withdrawal_btc}
                onChange={(e) => updateSetting('min_withdrawal_btc', e.target.value)}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
