'use client';

import { motion } from 'framer-motion';
import type { CreditBucket } from '@/types';


interface CreditBucketCardProps {
  bucket: CreditBucket;
  onConvert: (bucket: CreditBucket) => void;
}

function CreditBucketCard({ bucket, onConvert }: CreditBucketCardProps) {
  const percentage = (bucket.remaining_balance / bucket.original_balance) * 100;
  const daysUntilExpiry = Math.max(0, Math.round(
    (new Date(bucket.soft_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));

  const getStatusColor = () => {
    if (daysUntilExpiry <= 3) return 'bg-red-500';
    if (daysUntilExpiry <= 7) return 'bg-orange-500';
    if (percentage < 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (daysUntilExpiry <= 3) return '⚠️ Expiring soon';
    if (daysUntilExpiry <= 7) return '⏳ Expiring in 7 days';
    if (percentage < 20) return '🔄 Auto-convert enabled';
    return '✅ Active';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {bucket.source_type.charAt(0).toUpperCase() + bucket.source_type.slice(1)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
              {bucket.app_name}
            </span>
            {bucket.peak_restricted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                🌙 Off-peak
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {bucket.remaining_balance.toFixed(2)} / {bucket.original_balance.toFixed(2)} credits
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Expires: {new Date(bucket.soft_expiry).toLocaleDateString()}
            </span>
            <span className={`text-sm ${getStatusColor().replace('bg-', 'text-')}`}>{getStatusText()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {bucket.remaining_balance > 0 && (
            <button
              onClick={() => onConvert(bucket)}
              className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
            >
              Convert
            </button>
          )}
          <button className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition">
            Details
          </button>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getStatusColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </motion.div>
  );
}

interface CreditBucketsProps {
  buckets?: CreditBucket[];
  selectedApp: string;
  onAppFilter: (app: string) => void;
  onConvert: (bucket: CreditBucket) => void;
}

export function CreditBuckets({ buckets = [], selectedApp, onAppFilter, onConvert }: CreditBucketsProps) {
  const appOptions = ['all', ...new Set(buckets.map((b) => b.app_name))];
  const filteredBuckets = buckets.filter(
    (b) => selectedApp === 'all' || b.app_name === selectedApp
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Credit Buckets</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedApp}
            onChange={(e) => onAppFilter(e.target.value)}
            className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {appOptions.map((app) => (
              <option key={app} value={app}>
                {app === 'all' ? 'All Apps' : app}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredBuckets.length} active
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {filteredBuckets.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No credit buckets available
          </div>
        ) : (
          filteredBuckets.map((bucket) => (
            <CreditBucketCard key={bucket.id} bucket={bucket} onConvert={onConvert} />
          ))
        )}
      </div>
    </div>
  );
}
