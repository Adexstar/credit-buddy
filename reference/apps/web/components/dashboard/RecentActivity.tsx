'use client';

import { motion } from 'framer-motion';
import type { Activity } from '@/types';


interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'usage': return '📊';
      case 'conversion': return '🔄';
      case 'sync': return '🔄';
      case 'expiry': return '⏰';
      case 'add': return '➕';
      default: return '📌';
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case 'usage': return 'text-blue-600 dark:text-blue-400';
      case 'conversion': return 'text-purple-600 dark:text-purple-400';
      case 'sync': return 'text-green-600 dark:text-green-400';
      case 'expiry': return 'text-orange-600 dark:text-orange-400';
      case 'add': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition"
    >
      <div className={`text-xl ${getColor()}`}>{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.app_name}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</span>
          {activity.amount !== undefined && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span
                className={`text-xs font-medium ${
                  activity.amount > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {activity.amount > 0 ? '+' : ''}{activity.amount.toFixed(2)} credits
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface RecentActivityProps {
  activities?: Activity[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const sampleActivities: Activity[] = activities.length > 0 ? activities : [
    {
      type: 'usage',
      message: 'Used 12.5 credits on GPT-4 request',
      app_name: 'OpenAI',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      amount: -12.5,
    },
    {
      type: 'conversion',
      message: 'Converted 50 OpenAI credits to Claude',
      app_name: 'Claude',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      amount: 45,
    },
    {
      type: 'sync',
      message: 'Balance synced with provider',
      app_name: 'Replicate',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      type: 'add',
      message: 'Added 100 credits from promo code',
      app_name: 'Midjourney',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      amount: 100,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">⏱️ Recent Activity</h2>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {sampleActivities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </div>
    </div>
  );
}
