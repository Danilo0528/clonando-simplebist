'use client';

import { useState } from 'react';
import { useWallet } from '../../../hooks/useWallet'; // Import the custom hook
import Breadcrumb from '../../../components/Breadcrumb';
import WalletSummary from '../../../components/wallet/WalletSummary';
import TransactionHistoryTable from '../../../components/wallet/TransactionHistoryTable';
import WithdrawModal from '../../../components/wallet/WithdrawModal';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function WalletPage() {
  // Use the custom hook to manage wallet state
  const {
    transactions,
    loading,
    error,
    currentBalance,
    totalEarned,
    totalWithdrawn,
    addTransaction,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const breadcrumbItems = [{ label: 'Wallet' }];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleWithdrawalSuccess = (newTransaction) => {
    addTransaction(newTransaction);
    // The balance will update automatically because the hook manages it
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          {/* Skeleton for WalletSummary */}
          <div className="bg-gray-800/60 rounded-xl p-8 animate-pulse">
            <div className="h-16 w-3/4 bg-gray-700 rounded-lg"></div>
          </div>
          {/* Skeleton for TransactionHistoryTable */}
          <div className="bg-gray-800/60 rounded-xl p-6 animate-pulse">
            <div className="h-8 w-1/2 bg-gray-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-700 rounded-lg"></div>
              <div className="h-12 bg-gray-700 rounded-lg"></div>
              <div className="h-12 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-500/10 p-8 rounded-lg shadow-lg">
          <FaExclamationTriangle className="text-5xl mb-4 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold mb-2 text-white">Error Loading Wallet</h2>
          <p>{error}</p>
        </div>
      );
    }

    return (
      <>
        <WalletSummary 
          balance={currentBalance}
          totalEarned={totalEarned}
          totalWithdrawn={totalWithdrawn}
          onWithdrawClick={handleOpenModal}
        />
        <TransactionHistoryTable transactions={transactions} />
      </>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      {renderContent()}
      <WithdrawModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        balance={currentBalance}
        onWithdrawalSuccess={handleWithdrawalSuccess}
      />
    </div>
  );
}
