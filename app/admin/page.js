import prisma from '../../../lib/prisma';
import { FaUsers, FaMoneyBillWave, FaChartLine, FaFaucet } from 'react-icons/fa';

export default async function AdminDashboard() {
  // Get basic stats
  const totalUsers = await prisma.user.count();
  const totalBalance = await prisma.user.aggregate({
    _sum: {
      balance: true,
      tokenBalance: true,
    },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      username: true,
      email: true,
      balance: true,
      level: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FaUsers className="text-3xl text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
          <p className="text-sm text-gray-400">Total Users</p>
        </div>

        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FaMoneyBillWave className="text-3xl text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {totalBalance._sum.balance?.toFixed(2) || 0}
          </p>
          <p className="text-sm text-gray-400">Total Balance (SBT)</p>
        </div>

        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-3xl text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {totalBalance._sum.tokenBalance?.toFixed(2) || 0}
          </p>
          <p className="text-sm text-gray-400">Total Tokens</p>
        </div>

        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FaFaucet className="text-3xl text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400">Today's Claims</p>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-sm text-gray-400">ID</th>
                <th className="text-left py-2 px-3 text-sm text-gray-400">Username</th>
                <th className="text-left py-2 px-3 text-sm text-gray-400">Email</th>
                <th className="text-left py-2 px-3 text-sm text-gray-400">Balance</th>
                <th className="text-left py-2 px-3 text-sm text-gray-400">Level</th>
                <th className="text-left py-2 px-3 text-sm text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800">
                  <td className="py-2 px-3 text-sm text-gray-300">{user.id}</td>
                  <td className="py-2 px-3 text-sm text-white">{user.username}</td>
                  <td className="py-2 px-3 text-sm text-gray-300">{user.email}</td>
                  <td className="py-2 px-3 text-sm text-green-400">{user.balance.toFixed(2)}</td>
                  <td className="py-2 px-3 text-sm text-blue-400">{user.level}</td>
                  <td className="py-2 px-3 text-sm text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
