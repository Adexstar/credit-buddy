import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api-client';
import type { Activity, App, CreditBucket, Stats, UsageData } from '@/types';


export function useCredits() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [buckets, setBuckets] = useState<CreditBucket[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);

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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
