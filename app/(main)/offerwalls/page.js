'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaExclamationTriangle } from 'react-icons/fa';
import Breadcrumb from '../../../components/Breadcrumb';
import OfferwallCard from '../../../components/offerwalls/OfferwallCard';

const DynamicHistoryTable = dynamic(() => import('../../../components/offerwalls/HistoryTable'), {
  loading: () => <p className="text-center text-gray-400 py-8">Loading history...</p>,
  ssr: false
});

export default function OfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offerwallsRes, historyRes] = await Promise.all([
          fetch('/api/offerwalls'),
          fetch('/api/history'),
        ]);

        if (!offerwallsRes.ok || !historyRes.ok) {
          throw new Error('Failed to fetch data from the server.');
        }

        const offerwallsData = await offerwallsRes.json();
        const historyData = await historyRes.json();

        setOfferwalls(offerwallsData);
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError('Could not load offerwall data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const breadcrumbItems = [{ label: 'Offerwalls' }];

  const renderOfferwallCards = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="w-full h-36 bg-gray-700 rounded-lg mb-4"></div>
            <div className="w-3/4 h-6 bg-gray-700 rounded mb-2"></div>
            <div className="w-full h-12 bg-gray-700 rounded mb-4"></div>
            <div className="w-full h-12 bg-gray-700 rounded-lg"></div>
        </div>
      ));
    }
    return offerwalls.map((offer) => (
        <OfferwallCard key={offer.id} offer={offer} />
    ));
  }

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-500/10 p-8 rounded-lg flex flex-col items-center shadow-lg">
          <FaExclamationTriangle className="text-5xl mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-white">An Error Occurred</h2>
          <p className="text-red-300">{error}</p>
        </div>
      );
    }

    return (
      <>
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">Discover Offerwalls</h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">Choose a provider to start completing offers and earning Bits. New offers are added daily!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-16">
            {renderOfferwallCards()}
        </div>
        <DynamicHistoryTable history={history} />
      </>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      {renderContent()}
    </div>
  );
}
