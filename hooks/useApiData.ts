import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface UseApiDataOptions<T, P = any> {
  fetchFn: (params?: P) => Promise<T>;
  params?: P;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
  showErrorToast?: boolean;
}

export interface UseApiDataReturn<T, P = any> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: (newParams?: P) => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApiData<T, P = any>({
  fetchFn,
  params,
  onSuccess,
  onError,
  enabled = true,
  showErrorToast = true,
}: UseApiDataOptions<T, P>): UseApiDataReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(
    async (fetchParams?: P) => {
      if (!enabled) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn(fetchParams || params);
        setData(result);
        onSuccess?.(result);
      } catch (err: any) {
        setError(err);
        if (showErrorToast) {
          toast.error(err.response?.data?.message || 'Failed to fetch data');
        }
        onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, params, enabled, onSuccess, onError, showErrorToast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(
    async (newParams?: P) => {
      await fetchData(newParams);
    },
    [fetchData]
  );

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}
