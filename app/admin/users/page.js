'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaBan, FaCheck, FaUsers, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUsers();
  }, [pagination.page, searchQuery]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load users');

      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditData({
      balance: user.balance,
      tokenBalance: user.tokenBalance,
      boundTokenBalance: user.boundTokenBalance,
      energyPoints: user.energyPoints,
      level: user.level,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingUser, ...editData }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      await loadUsers();
      setEditingUser(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleToggleAdmin = async (user) => {
    if (!confirm(`Make ${user.username} an admin?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          isAdmin: !user.isAdmin,
        }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Delete user ${user.username}? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete user');

      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaUsers className="text-blue-400" />
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total} total users</p>
        </div>
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Balance</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Tokens</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Level</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Joined</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                            <span className="text-cyan-400 font-bold text-sm">
                              {user.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-green-400 text-sm">{user.balance.toFixed(2)} SBT</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-yellow-400 text-sm">{user.tokenBalance.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Bound: {user.boundTokenBalance.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-blue-400 text-sm">Level {user.level}</p>
                        <p className="text-xs text-gray-500">{user.xp} XP</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              user.isActive
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Banned'}
                          </button>
                          {user.isAdmin && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            className="p-2 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                            title="Toggle Admin"
                          >
                            {user.isAdmin ? <FaBan /> : <FaCheck />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="p-2 rounded bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowLeft />
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.balance}
                  onChange={(e) => setEditData({ ...editData, balance: parseFloat(e.target.value) })}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Token Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.tokenBalance}
                  onChange={(e) => setEditData({ ...editData, tokenBalance: parseFloat(e.target.value) })}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bound Token Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.boundTokenBalance}
                  onChange={(e) => setEditData({ ...editData, boundTokenBalance: parseFloat(e.target.value) })}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Level</label>
                <input
                  type="number"
                  value={editData.level}
                  onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) })}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Is Admin</label>
                <input
                  type="checkbox"
                  checked={editData.isAdmin}
                  onChange={(e) => setEditData({ ...editData, isAdmin: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Is Active</label>
                <input
                  type="checkbox"
                  checked={editData.isActive}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
