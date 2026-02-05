'use client';

import { useState } from 'react';
import { FaSignInAlt, FaFaucet } from 'react-icons/fa';
import LoginForm from './LoginForm';
import FaucetModal from '../faucet/FaucetModal'; // Importar el modal del faucet

const GuestMenu = ({ onLogin }) => {
  const [loginFormVisible, setLoginFormVisible] = useState(true); // Changed to true
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  return (
    <>
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
            <LoginForm onLogin={onLogin} onCancel={() => setLoginFormVisible(false)} />
          ) : (
            <div className="px-4 space-y-2">
              <button
                onClick={() => setLoginFormVisible(true)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-green-600/30 text-green-400 flex items-center"
              >
                <FaSignInAlt className="mr-2" /> Login
              </button>
              <button
                onClick={() => setLoginFormVisible(true)} // This should probably go to a register page
                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/30 text-blue-400"
              >
                Register
              </button>
              <button
                onClick={() => setShowFaucetModal(true)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 flex items-center"
              >
                <FaFaucet className="mr-2" /> Faucet
              </button>
            </div>
          )}
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

export default GuestMenu;