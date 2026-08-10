import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";

type CacheEntry = { data: unknown; timestamp: number };

/** Module-level cache so it survives re-renders and is shared across components. */
const cacheStore = new Map<string, CacheEntry>();

export function invalidateApiCache(cacheKey?: string) {
  if (cacheKey) cacheStore.delete(cacheKey);
  else cacheStore.clear();
}

export type UseApiOptions<T> = {
  immediate?: boolean;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  suppressErrors?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  dependencies?: unknown[];
};

export function useApi<TArgs extends unknown[], TData>(
  apiFunction: (...args: TArgs) => Promise<TData>,
  options: UseApiOptions<TData> = {},
) {
  const {
    immediate = true,
    cache = false,
    cacheKey,
    cacheTTL = 60_000,
    suppressErrors = false,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<TData | null>(() => {
    if (!cache || !cacheKey) return null;
    const entry = cacheStore.get(cacheKey);
    return entry && Date.now() - entry.timestamp < cacheTTL ? (entry.data as TData) : null;
  });
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fnRef = useRef(apiFunction);
  fnRef.current = apiFunction;
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;
  const errorRef = useRef(onError);
  errorRef.current = onError;

  const execute = useCallback(
    async (...args: TArgs): Promise<TData> => {
      if (cache && cacheKey) {
        const entry = cacheStore.get(cacheKey);
        if (entry && Date.now() - entry.timestamp < cacheTTL) {
          setData(entry.data as TData);
          setLoading(false);
          return entry.data as TData;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current(...args);
        setData(result);
        setLoading(false);
        if (cache && cacheKey) cacheStore.set(cacheKey, { data: result, timestamp: Date.now() });
        successRef.current?.(result);
        return result;
      } catch (caught) {
        const normalized =
          caught instanceof Error ? caught : new ApiError("Request failed", 0, "unknown_error", caught);
        setError(normalized);
        setLoading(false);
        if (!suppressErrors) toast.error(normalized.message);
        errorRef.current?.(caught);
        throw normalized;
      }
    },
    [cache, cacheKey, cacheTTL, suppressErrors],
  );

  useEffect(() => {
    if (!immediate) return;
    void execute(...([] as unknown as TArgs)).catch(() => {
      // Error state is already tracked; keep the effect from rejecting.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...dependencies]);

  return { data, loading, error, execute, setData, refetch: execute };
}
