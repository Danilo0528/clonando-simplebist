'use client';

import { useState, useEffect, useCallback } from 'react';

export function useWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Fetch user balances
      const balancesRes = await fetch('/api/user/balances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!balancesRes.ok) {
        throw new Error('Failed to fetch balance data.');
      }

      const balancesData = await balancesRes.json();
      setCurrentBalance(balancesData.balances?.tokenBalance || 0);

      // Fetch withdrawal history
      const withdrawalsRes = await fetch('/api/withdrawal/request', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let withdrawals = [];
      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        withdrawals = withdrawalsData.history || [];
        setTotalWithdrawn(withdrawalsData.totalWithdrawn || 0);
      }

      // Transform withdrawals to transaction format
      const withdrawalTransactions = withdrawals.map(w => ({
        id: w.id,
        date: w.createdAt,
        type: 'withdrawal',
        amount: -w.amount,
        currency: w.cryptoCurrency,
        status: w.status,
        description: `Withdrawal to ${w.address.substring(0, 10)}...`,
      }));

      // Fetch mining history (as earned transactions)
      // For now, we'll use the current balance as total earned
      // In a production app, you'd have a proper transaction history table
      setTotalEarned(balancesData.balances?.tokenBalance || 0);
      setTransactions(withdrawalTransactions);

    } catch (err) {
      setError(err.message);
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const addTransaction = useCallback((newTransaction) => {
    setTransactions(prevTransactions =>
      [newTransaction, ...prevTransactions]
    );
  }, []);

  return {
    transactions,
    loading,
    error,
    currentBalance,
    totalEarned,
    totalWithdrawn,
    addTransaction,
    refresh: fetchWalletData,
  };
}
