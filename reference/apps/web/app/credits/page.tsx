'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useCredits } from '@/hooks/useCredits';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { CreditBuckets } from '@/components/dashboard/CreditBuckets';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { TimeRange } from '@/types';

export default function CreditsPage() {
  const { buckets, stats, usageData, activities, loading } = useCredits();
  const [selectedApp, setSelectedApp] = useState('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Overview</h1>
          <div className="flex justify-between items-center mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats?.totalBalance?.toFixed(2) ?? '0.00'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">(Across all apps)</p>
          </div>
        </div>

        <CreditBuckets
          buckets={buckets}
          selectedApp={selectedApp}
          onAppFilter={setSelectedApp}
          onConvert={() => {}}
        />

        <UsageChart data={usageData ?? undefined} timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        <RecentActivity activities={activities} />
      </div>
    </DashboardLayout>
  );
}
