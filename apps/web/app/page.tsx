'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Milestones } from '@/components/dashboard/Milestones';
import { ConnectedApps } from '@/components/dashboard/ConnectedApps';
import { CreditBuckets } from '@/components/dashboard/CreditBuckets';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function HomePage() {
  const { user } = useAuth();
  const { stats, apps, buckets, usageData, activities, loading, fetchDashboardData, refreshData } = useCredits();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'User'} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all your AI credits in one place
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={refreshData}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <StatsCards 
          connectedApps={apps?.length || 0}
          activeBuckets={buckets?.filter(b => b.remaining_balance > 0).length || 0}
          expiringCredits={buckets?.filter(b => {
            const daysUntilExpiry = (new Date(b.soft_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
          }).reduce((sum, b) => sum + b.remaining_balance, 0) || 0}
          totalBalance={stats?.totalBalance || 0}
        />

        <Milestones 
          connectedApps={apps?.length || 0}
          hasPolicies={stats?.hasPolicies || false}
          hasProxyUsage={stats?.hasProxyUsage || false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <ConnectedApps 
              apps={apps}
              onRefresh={() => {}}
              onConnect={() => {}}
            />
            <CreditBuckets 
              buckets={buckets}
              selectedApp="all"
              onAppFilter={() => {}}
              onConvert={() => {}}
            />
          </div>
          <div className="space-y-6">
            <RecentActivity activities={activities} />
          </div>
        </div>

        <div className="mt-8">
          <UsageChart 
            data={usageData || {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              used: [100, 120, 80, 140, 160, 90],
              added: [90, 110, 100, 150, 180, 110]
            }}
            timeRange="week"
            onTimeRangeChange={() => {}}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}