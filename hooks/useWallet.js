'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

export function useWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        if (!res.ok) {
          throw new Error('Failed to fetch transaction data.');
        }
        const data = await res.json();
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const walletStats = useMemo(() => {
    return transactions.reduce((acc, tx) => {
        if (tx.status === 'Completed') {
            if (tx.amount > 0) {
                acc.totalEarned += tx.amount;
            } else {
                acc.totalWithdrawn += Math.abs(tx.amount);
            }
        }
        return acc;
    }, { totalEarned: 0, totalWithdrawn: 0 });
  }, [transactions]);

  const currentBalance = walletStats.totalEarned - walletStats.totalWithdrawn;

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
    totalEarned: walletStats.totalEarned,
    totalWithdrawn: walletStats.totalWithdrawn,
    addTransaction,
  };
}
