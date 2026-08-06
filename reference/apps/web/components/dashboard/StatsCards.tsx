'use client';

import { motion } from 'framer-motion';
import { Users, CreditCard, Clock, Wallet } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  color?: 'blue' | 'purple' | 'orange' | 'green';
}

function StatCard({ icon, label, value, subtext, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      {trend && (
        <div
          className={`mt-3 text-xs ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}% from last month
        </div>
      )}
    </motion.div>
  );
}

interface StatsCardsProps {
  connectedApps: number;
  activeBuckets: number;
  expiringCredits: number;
  totalBalance: number;
}

export function StatsCards({
  connectedApps,
  activeBuckets,
  expiringCredits,
  totalBalance,
}: StatsCardsProps) {
  const stats = [
    {
      icon: <Users size={24} />,
      label: 'Connected Apps',
      value: connectedApps,
      subtext: `${connectedApps}/5 supported`,
      color: 'blue' as const,
    },
    {
      icon: <CreditCard size={24} />,
      label: 'Active Buckets',
      value: activeBuckets,
      subtext: 'Credit pools available',
      color: 'purple' as const,
    },
    {
      icon: <Clock size={24} />,
      label: 'Expiring Credits',
      value: `$${expiringCredits.toFixed(2)}`,
      subtext: 'Expiring in 7 days',
      color: 'orange' as const,
    },
    {
      icon: <Wallet size={24} />,
      label: 'Total Balance',
      value: `$${totalBalance.toFixed(2)}`,
      subtext: 'Across all apps',
      color: 'green' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}