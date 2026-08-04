'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useCredits } from '@/hooks/useCredits';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { CreditBuckets } from '@/components/dashboard/CreditBuckets';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function CreditsPage() {
  const { buckets, stats, loading } = useCredits();

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
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Overview</h1>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.totalBalance?.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                (Across all apps)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {(buckets || []).map((bucket) => (
            <div key={bucket.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center">
                <span className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <p className="text-indigo-600 dark:text-indigo-400">{bucket.original_balance.toFixed(2)}</p>
                </span>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${bucket.remaining_balance.toFixed(2)} available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires: {new Date(bucket.soft_expiry).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
}