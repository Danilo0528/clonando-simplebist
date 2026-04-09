'use client';

import { useState } from 'react';

const LoginForm = ({ onLogin, onCancel, error }) => {
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await onLogin(loginCredentials);
      if (success) {
        setLoginCredentials({ username: '', password: '' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="px-4 space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}
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
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-1.5 rounded text-sm"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white py-1.5 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default LoginForm;