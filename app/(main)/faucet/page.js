'use client';

import Breadcrumb from '../../../components/Breadcrumb';
import Faucet from '../../../components/faucet/Faucet';

export default function FaucetPage() {
  const breadcrumbItems = [{ label: 'Faucet' }];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mt-8">
        <Faucet />
      </div>
    </div>
  );
}
