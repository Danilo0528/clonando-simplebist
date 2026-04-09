'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaMoneyBillWave, FaFilter } from 'react-icons/fa';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/withdrawals${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load withdrawals');

      const data = await res.json();
      setWithdrawals(data);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const action = status === 'completed' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update withdrawal');
      }

      await loadWithdrawals();
      setSelectedWithdrawal(null);
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      alert(`Failed to ${action} withdrawal: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return badges[status] || badges.pending;
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaMoneyBillWave className="text-green-400" />
            Withdrawal Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">{withdrawals.length} withdrawal requests</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-12 text-center">
            <FaMoneyBillWave className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No withdrawal requests</p>
            <p className="text-sm text-gray-500 mt-2">Withdrawal requests will appear here</p>
          </div>
        ) : (
          withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{withdrawal.user.username}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-white font-semibold">{withdrawal.amount.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Currency</p>
                      <p className="text-yellow-400 font-semibold">{withdrawal.cryptoCurrency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fee</p>
                      <p className="text-red-400 font-semibold">{withdrawal.fee.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Net Amount</p>
                      <p className="text-green-400 font-semibold">{withdrawal.netAmount.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                    <p className="text-sm text-gray-300 font-mono bg-black/20 px-3 py-2 rounded">
                      {withdrawal.address}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(withdrawal.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                    className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  {withdrawal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(withdrawal.id, 'completed')}
                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        title="Approve"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(withdrawal.id, 'rejected')}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Withdrawal Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">User</p>
                <p className="text-white font-semibold">{selectedWithdrawal.user.username}</p>
                <p className="text-xs text-gray-500">{selectedWithdrawal.user.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p className="text-white font-semibold">{selectedWithdrawal.amount.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Currency</p>
                  <p className="text-yellow-400 font-semibold">{selectedWithdrawal.cryptoCurrency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fee</p>
                  <p className="text-red-400 font-semibold">{selectedWithdrawal.fee.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Net Amount</p>
                  <p className="text-green-400 font-semibold">{selectedWithdrawal.netAmount.toFixed(4)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <p className="text-sm text-gray-300 font-mono bg-black/20 px-3 py-2 rounded break-all">
                  {selectedWithdrawal.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedWithdrawal.status)}`}>
                  {selectedWithdrawal.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Submitted</p>
                <p className="text-white text-sm">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              {selectedWithdrawal.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedWithdrawal.id, 'completed')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedWithdrawal.id, 'rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
