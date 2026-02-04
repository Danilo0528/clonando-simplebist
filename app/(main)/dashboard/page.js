import WelcomeBanner from '../../../components/dashboard/WelcomeBanner';
import QuickActions from '../../../components/dashboard/QuickActions';
import LiveFeed from '../../../components/dashboard/LiveFeed';
import FeaturedOfferwalls from '../../../components/dashboard/FeaturedOfferwalls';

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <WelcomeBanner />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveFeed />
        <FeaturedOfferwalls />
      </div>
    </div>
  );
}
