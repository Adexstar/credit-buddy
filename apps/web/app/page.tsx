'use client';

import { useState } from 'react';
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
import ConnectAppModal from '@/components/modals/ConnectAppModal';
import type { TimeRange } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const { stats, apps, buckets, usageData, activities, loading, refreshData } = useCredits();
  const [selectedApp, setSelectedApp] = useState('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [connectOpen, setConnectOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const expiringCredits = (buckets || [])
    .filter((bucket) => {
      const days =
        (new Date(bucket.soft_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days <= 7 && days > 0;
    })
    .reduce((sum, bucket) => sum + bucket.remaining_balance, 0);

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
              type="button"
              onClick={refreshData}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              onClick={() => setConnectOpen(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Connect App
            </button>
          </div>
        </div>

        <StatsCards
          connectedApps={apps?.length || 0}
          activeBuckets={buckets?.filter((b) => b.remaining_balance > 0).length || 0}
          expiringCredits={expiringCredits}
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
              onRefresh={() => setConnectOpen(true)}
              onConnect={() => setConnectOpen(true)}
            />
            <CreditBuckets
              buckets={buckets}
              selectedApp={selectedApp}
              onAppFilter={setSelectedApp}
              onConvert={() => {}}
            />
          </div>
          <div className="space-y-6">
            <RecentActivity activities={activities} />
          </div>
        </div>

        <div className="mt-8">
          <UsageChart
            data={usageData ?? undefined}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>

      <ConnectAppModal
        isOpen={connectOpen}
        onClose={() => {
          setConnectOpen(false);
          refreshData();
        }}
      />
    </DashboardLayout>
  );
}
