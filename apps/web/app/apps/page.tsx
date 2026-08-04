'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ConnectedApps } from '@/components/dashboard/ConnectedApps';
import { useCredits } from '@/hooks/useCredits';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AppsPage() {
  const { apps, loading } = useCredits();

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connected Apps</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your AI provider connections
          </p>
        </div>

        <ConnectedApps apps={apps} />

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New App</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['OpenAI', 'Claude', 'Midjourney', 'Replicate'].map((app) => (
              <div key={app} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {app === 'OpenAI' && '🤖'}
                    {app === 'Claude' && '🧠'}
                    {app === 'Midjourney' && '🎨'}
                    {app === 'Replicate' && '⚡'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{app}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect your API key</p>
                  </div>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}