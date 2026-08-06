'use client';

import { motion } from 'framer-motion';
import type { App } from '@/types';


interface AppCardProps {
  app: App;
}

function AppCard({ app }: AppCardProps) {
  const statusColors = {
    healthy: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    stale: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    never: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      healthy: 'Synced',
      stale: 'Stale sync',
      error: 'Sync error',
      never: 'Not synced',
    };
    return map[status] || status;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white dark:bg-gray-600 shadow-sm">
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-8 h-8 object-contain"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[app.sync_status]}`}>
              {getStatusText(app.sync_status)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {app.credits} credits
            </span>
            {app.last_sync && (
              <span className="text-xs text-gray-400">
                Last sync: {new Date(app.last_sync).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ConnectedAppsProps {
  apps?: App[];
  onRefresh?: () => void;
  onConnect?: () => void;
}

export function ConnectedApps({ apps = [], onRefresh, onConnect }: ConnectedAppsProps) {
  if (!apps || apps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <div className="text-4xl mb-4">🔌</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No apps connected</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Connect your AI provider API keys to start managing credits
        </p>
        <button
          onClick={onConnect}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Connect First App
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Connected Apps</h2>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          + Add App
        </button>
      </div>
      <div className="space-y-3">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}