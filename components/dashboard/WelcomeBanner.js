'use client';

import { FaArrowUp, FaChartLine } from 'react-icons/fa';
import axios from '../../lib/axiosConfig';
import { useEffect, useState } from 'react';

const StatCard = ({ title, value, change, icon, color }) => (
  <div className="text-center">
    <div className="text-xs text-gray-400 mb-1">{title}</div>
    <div className={`font-bold text-${color}-400`}>{value}</div>
    <div className="text-xs text-green-500 flex items-center justify-center">
        <FaArrowUp size={10} className="mr-1" />
        {change}
    </div>
  </div>
);

export default function WelcomeBanner() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        const userData = response.data;
        setUser(userData);
      } catch (error) {
        // Si el error es 401 (no autenticado), significa que no hay usuario logueado
        // Esto es esperado cuando el usuario no ha iniciado sesión
        if (error.response && error.response.status === 401) {
          console.log("No user found, rendering generic welcome message.");
        } else {
          console.error('Failed to fetch user:', error);
        }
        // Dejar que el usuario permanezca como null si no está autenticado
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#252736] p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-bold text-xl text-white">Loading...</h1>
            <p className="text-gray-400 text-sm">Ready to earn some more?</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#252736] p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="font-bold text-xl text-white">
                  {user ? `Welcome back, ${user.username}!` : 'Welcome!'}
                </h1>
                <p className="text-gray-400 text-sm">Ready to earn some more?</p>
            </div>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
            <h3 className="font-bold text-sm mb-3 flex items-center text-cyan-400">
                <FaChartLine className="mr-2" /> This Month&apos;s Earnings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Offerwalls" value="1,203.50" change="+25.5%" color="cyan" />
                <StatCard title="Faucet" value="512.25" change="+10.2%" color="yellow" />
                <StatCard title="Referrals" value="89.10" change="+5.8%" color="green" />
                <StatCard title="Hardware" value="2,150.75" change="+18.1%" color="purple" />
            </div>
      </div>
    </div>
  );
}