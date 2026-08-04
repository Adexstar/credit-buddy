import { useState, useCallback } from 'react';
import { api } from '@/lib/api-client';

interface Bucket {
  id: string;
  source_type: string;
  app_name: string;
  app_id: string;
  remaining_balance: number;
  original_balance: number;
  soft_expiry: string;
  peak_restricted: boolean;
}

interface App {
  id: string;
  name: string;
  icon_url: string;
  sync_status: 'healthy' | 'stale' | 'error' | 'never';
  credits: number;
  last_sync: string;
}

interface Stats {
  totalBalance: number;
  hasPolicies: boolean;
  hasProxyUsage: boolean;
}

interface Activity {
  type: string;
  message: string;
  app_name: string;
  timestamp: string;
  amount?: number;
}

export function useCredits() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [usageData, setUsageData] = useState<{
    labels: string[];
    used: number[];
    added: number[];
  } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, bucketsRes, usageRes, activityRes] = await Promise.all([
        api.get('/credits/stats'),
        api.get('/apps/connected'),
        api.get('/credits/buckets'),
        api.get('/credits/usage'),
        api.get('/credits/activity'),
      ]);

      setStats(statsRes.data);
      setApps(appsRes.data);
      setBuckets(bucketsRes.data);
      setUsageData(usageRes.data);
      setActivities(activityRes.data);
    } catch (_error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    apps,
    buckets,
    usageData,
    activities,
    loading,
    fetchDashboardData,
    refreshData,
  };
}
