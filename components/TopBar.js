'use client';

import { FaCoins, FaChevronDown, FaComment, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useStats } from '../context/StatsContext';
import { useState } from 'react';

const TopBar = () => {
  const { userData, loading, login, logout } = useStats();
  const [loginFormVisible, setLoginFormVisible] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(loginCredentials);
    setLoginFormVisible(false);
    setLoginCredentials({ username: '', password: '' });
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#1e202b] h-12 flex items-center justify-between px-4 border-b border-gray-800">
        <div className="w-48"></div>
        <div className="flex items-center space-x-2">
          <img src="/images/logo.svg" alt="SimpleBits Logo" className="h-7"/>
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
        <div className="w-48"></div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#1e202b] h-12 flex items-center justify-between px-4 border-b border-gray-800">
      {/* Left placeholder */}
      <div className="w-48"></div>

      {/* Middle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <img src="/images/logo.svg" alt="SimpleBits Logo" className="h-7"/>
        </div>

        {/* Token balances dropdown */}
        <div className="relative group">
          <button className="bg-black/40 hover:bg-black/60 p-2 rounded-md flex items-center space-x-2">
            <FaCoins className="text-yellow-400" />
            <span className="font-semibold text-sm">
              {userData.balances.simplebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <FaChevronDown className="text-xs"/>
          </button>

          {/* Dropdown menu for multiple tokens */}
          <div className="absolute hidden group-hover:block top-full right-0 mt-1 w-48 bg-[#2a2c3a] rounded-md shadow-lg py-2 z-50 border border-gray-700">
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Token</span>
                <span>Balance</span>
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <FaCoins className="text-yellow-400 mr-2" /> SimpleBits
                </span>
                <span>{userData.balances.simplebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <FaCoins className="text-green-400 mr-2" /> Energy
                </span>
                <span>{Math.round(userData.balances.energy)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-3 w-48 justify-end">
        <button className="bg-gray-700/50 hover:bg-gray-600/50 p-2 rounded-md">
          <FaComment className="text-lg"/>
        </button>

        {userData.isLoggedIn ? (
          // User logged in view
          <div className="relative group">
            <div className="bg-[#2a2c3a] hover:bg-[#303242] p-1 rounded-md flex items-center space-x-2 cursor-pointer">
              <div
                className="w-8 h-9 bg-yellow-500/20 border-2 border-yellow-600 flex items-center justify-center font-bold text-xs text-yellow-500"
                style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}
              >
                {userData.profile.avatarInitials}
              </div>
              <div className="pr-1">
                <span className="text-xs font-semibold">{userData.username}</span>
                <div className="text-[8px] text-gray-400">Level {userData.balances.level}</div>
                <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                  <div
                    className="bg-yellow-400 h-1 rounded-full"
                    style={{ width: `${userData.balances.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-[7px] text-gray-500 mt-0.5">{userData.balances.expForCurrentLevel}/{userData.balances.expForNextLevel} EXP</div>
              </div>
            </div>

            {/* Logout dropdown */}
            <div className="absolute hidden group-hover:block top-full right-0 mt-1 w-32 bg-[#2a2c3a] rounded-md shadow-lg py-2 z-50 border border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-600/30 text-red-400 flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          </div>
        ) : (
          // User not logged in view
          <div className="relative group">
            <div className="bg-[#2a2c3a] hover:bg-[#303242] p-1 rounded-md flex items-center space-x-2 cursor-pointer">
              <div
                className="w-8 h-9 bg-gray-500/20 border-2 border-gray-600 flex items-center justify-center font-bold text-xs text-gray-400"
                style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}
              >
                ?
              </div>
              <div className="pr-1">
                <span className="text-xs font-semibold text-gray-400">Guest</span>
              </div>
            </div>

            {/* Login dropdown */}
            <div className="absolute hidden group-hover:block top-full right-0 mt-1 w-64 bg-[#2a2c3a] rounded-md shadow-lg py-4 z-50 border border-gray-700">
              {loginFormVisible ? (
                <form onSubmit={handleLogin} className="px-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginCredentials.username}
                    onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})}
                    className="w-full p-2 bg-[#1e202b] rounded text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                    className="w-full p-2 bg-[#1e202b] rounded text-sm"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginFormVisible(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="px-4 space-y-2">
                  <button
                    onClick={() => setLoginFormVisible(true)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-600/30 text-green-400 flex items-center"
                  >
                    <FaSignInAlt className="mr-2" /> Login
                  </button>
                  <button
                    onClick={() => setLoginFormVisible(true)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/30 text-blue-400"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
