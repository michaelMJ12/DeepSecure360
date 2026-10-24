import { useCallback, useEffect, useState } from 'react';
import type { ApiMeta, ListParams } from '@/types/api';
import type { ResourceService } from '@/services/resourceService';
import { errorMessage } from '@/services/apiClient';

/** Loads a paginated list and re-fetches whenever params change. */
export function useList<T extends { id: string }>(service: ResourceService<T>, params: ListParams) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ page: 1, limit: params.limit, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    service
      .list(JSON.parse(key) as ListParams)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setMeta(res.meta);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [service, key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { items, meta, loading, error, reload };
}
