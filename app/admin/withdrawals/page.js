'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data - in production, create an API endpoint
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading withdrawals...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">ID</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Currency</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Address</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    No withdrawal requests found. Complete the Withdrawal model in Prisma schema to track withdrawals.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> To complete this page, add a <code className="bg-black/30 px-2 py-1 rounded">Withdrawal</code> model to your Prisma schema and create API endpoints for managing withdrawals.
        </p>
      </div>
    </div>
  );
}
