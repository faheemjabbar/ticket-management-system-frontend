import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '@/utils/errorHandler';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

/**
 * Generic hook for data fetching with loading and error states
 */
export function useDataFetching<T>({
  fetchFn,
  dependencies = [],
  onSuccess,
  onError,
  enabled = true,
}: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      setError(err);
      handleApiError(err, onError);
    } finally {
      setLoading(false);
    }
  }, [enabled, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
