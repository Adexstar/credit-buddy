import { useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { Policy } from '@/types';

export type { Policy };


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
