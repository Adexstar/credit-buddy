import { useState, useCallback } from 'react';
import { api } from '@/lib/api-client';

export interface Policy {
  id: string;
  app_id: string;
  app_name: string;
  policy_name: string;
  rollover_percentage: number;
  max_rollover_cap: number | null;
  override_expiry_days: number | null;
  peak_restricted: boolean;
  allowed_hours: { start: number; end: number } | null;
  auto_convert_on_expiry: boolean;
  convert_to_app_id: string | null;
  conversion_rate: number | null;
  warn_at_percentage: number;
  notify_channels: string[];
  is_active: boolean;
}

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/policies');
      setPolicies(response.data);
    } catch (_error) {
      console.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (appId: string, data: Partial<Policy>) => {
    const response = await api.put(`/policies/${appId}`, data);
    setPolicies((prev) =>
      prev.map((p) => (p.app_id === appId ? { ...p, ...response.data } : p))
    );
    return response.data;
  }, []);

  return { policies, loading, fetchPolicies, updatePolicy };
}
