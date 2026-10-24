import { useEffect, useState } from 'react';
import type { AnalyticsSnapshot, TimeUnit } from '@/types/models';
import { analyticsService } from '@/services/analyticsService';
import { errorMessage } from '@/services/apiClient';
import { USE_MOCK } from '@/services/resourceService';

/** How often each time scale refreshes. Units not listed do not auto-refresh. */
export const LIVE_INTERVAL_MS: Partial<Record<TimeUnit, number>> = { second: 1000, minute: 5000, hour: 30000 };

/** Loads dashboard analytics for a time scale and keeps it fresh for the fast scales. */
export function useAnalytics(unit: TimeUnit) {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      analyticsService
        .get(unit)
        .then((s) => {
          if (cancelled) return;
          setSnapshot(s);
          setError(null);
        })
        .catch((e) => !cancelled && setError(errorMessage(e)));

    void load();
    const every = LIVE_INTERVAL_MS[unit];
    // Against the real API, never poll faster than every 5 seconds.
    const ms = every ? (USE_MOCK ? every : Math.max(every, 5000)) : undefined;
    const timer = ms ? setInterval(() => void load(), ms) : undefined;
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [unit]);

  return { snapshot, error };
}
