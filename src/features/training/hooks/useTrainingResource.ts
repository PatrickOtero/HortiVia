import { useCallback, useEffect, useRef, useState } from 'react';

export function useTrainingResource<T>(
  load: () => Promise<T>,
  { loadOnMount = true }: { loadOnMount?: boolean } = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestRef = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    setIsLoading(true);
    setError(false);
    try {
      const next = await load();
      if (requestRef.current === request) setData(next);
    } catch {
      if (requestRef.current === request) {
        setData(null);
        setError(true);
      }
    } finally {
      if (requestRef.current === request) setIsLoading(false);
    }
  }, [load]);
  useEffect(() => {
    if (loadOnMount) refresh();
    return () => {
      requestRef.current += 1;
    };
  }, [loadOnMount, refresh]);
  return { data, isLoading, error, refresh };
}
