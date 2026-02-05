'use client';

import WelcomeBanner from './WelcomeBanner';
import QuickActions from './QuickActions';
import FeaturedOfferwalls from './FeaturedOfferwalls';
import LiveFeed from './LiveFeed';

const DashboardCompact = () => {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <QuickActions />
      <FeaturedOfferwalls />
      <LiveFeed />
    </div>
  );
};

export default DashboardCompact;