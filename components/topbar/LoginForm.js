'use client';

import { useState } from 'react';

const LoginForm = ({ onLogin, onCancel }) => {
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await onLogin(loginCredentials);
    if (success) {
      setLoginCredentials({ username: '', password: '' });
    }
    // You might want to show an error message on failure
  };

  return (
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
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default LoginForm;