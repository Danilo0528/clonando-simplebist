'use client';

import { useState } from 'react';
import { FaSignOutAlt, FaUser, FaCog, FaFaucet } from 'react-icons/fa';
import axios from '../../lib/axiosConfig'; // Import axios for making API requests
import FaucetModal from '../faucet/FaucetModal'; // Importar el modal del faucet

const UserProfile = ({ user }) => {
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      // Remove token using the token manager
      const { removeToken } = await import('../../lib/tokenManager');
      removeToken();
      // On successful logout, redirect the user to the login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Failed to logout:', error);
      // Also remove token on error
      const { removeToken } = await import('../../lib/tokenManager');
      removeToken();
      // Optionally, show an error message to the user
      // Redirect to login anyway to ensure user state is reset
      window.location.href = '/auth/login';
    }
  };

  const getUsername = () => {
    // Handle different user object structures from StatsContext vs direct API
    if (user && typeof user === 'object') {
      // Check for direct username property (original API response)
      if (user.username) {
        return user.username;
      }
      // Check if it's from StatsContext and has username in nested structure
      if (user.userData && user.userData.username) {
        return user.userData.username;
      }
      // Check if user itself contains username (when user is the full user object)
      if (user.id && user.username) {
        return user.username;
      }
    }
    return '??'; // Fallback initials
  };

  const getLevel = () => {
    if (user && typeof user === 'object') {
      return user.level || (user.levelInfo && user.levelInfo.level) || 1;
    }
    return 1;
  };

  const getProgressPercentage = () => {
    if (user && typeof user === 'object') {
      return user.progressPercentage || (user.levelInfo && user.levelInfo.progressPercentage) || 0;
    }
    return 0;
  };

  const username = getUsername();
  const initials = username !== '??' ? username.substring(0, 2).toUpperCase() : '??';
  const level = getLevel();
  const progressPercentage = getProgressPercentage();

  return (
    <>
      <div className="relative group">
        <div className="bg-[#2a2c3a] hover:bg-[#303242] pl-1 pr-3 py-1 rounded-md flex items-center gap-2 cursor-pointer transition-colors duration-200">
          <div
            className="w-9 h-10 bg-yellow-500/20 border-2 border-yellow-600 flex items-center justify-center font-bold text-sm text-yellow-500"
            style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}
          >
            {initials}
          </div>
          <div className="flex-grow pr-1">
            <span className="text-sm font-semibold text-white">{username}</span>
            <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
              <div
                className="bg-yellow-400 h-1 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="absolute hidden group-hover:block top-full right-0 mt-2 w-48 bg-[#2a2c3a] rounded-md shadow-lg py-1 z-50 border border-gray-700">
          <div className="px-3 py-2 border-b border-gray-700">
            <p className="text-sm font-semibold text-white">{username}</p>
            <p className="text-xs text-gray-400">Level {level}</p>
          </div>
          <a href="/profile" className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 flex items-center">
            <FaUser className="mr-2" /> Profile
          </a>
          <a href="/settings" className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 flex items-center">
            <FaCog className="mr-2" /> Settings
          </a>
          <button
            onClick={() => setShowFaucetModal(true)}
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 flex items-center"
          >
            <FaFaucet className="mr-2" /> Faucet
          </button>
          {/* Logout button that now calls the handleLogout function */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm hover:bg-red-600/30 text-red-400 flex items-center"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Modal del Faucet */}
      <FaucetModal 
        isOpen={showFaucetModal} 
        onClose={() => setShowFaucetModal(false)} 
      />
    </>
  );
};

export default UserProfile;
