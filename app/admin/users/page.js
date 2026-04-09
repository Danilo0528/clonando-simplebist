'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaBan, FaCheck } from 'react-icons/fa';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // For now, we'll use a mock - in production, create an API endpoint
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
      </div>

      {/* Search */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e202b] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">ID</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Username</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Balance</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Level</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No users found. Create an API endpoint at /api/admin/users to load user data.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> To complete this page, create an API endpoint at <code className="bg-black/30 px-2 py-1 rounded">/api/admin/users</code> that returns user data with authentication and admin role checks.
        </p>
      </div>
    </div>
  );
}
