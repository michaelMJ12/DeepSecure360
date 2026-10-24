import type { SiemVendor, ThreatFeedSource, ThreatIndicator } from '@/types/models';
import { mockIndicators } from '@/mocks/data';
import { api } from './apiClient';
import { USE_MOCK } from './resourceService';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SiemQueryResult {
  vendor: SiemVendor;
  query: string;
  rowCount: number;
  rows: Array<Record<string, string>>;
  tookMs: number;
}

/**
 * Thin client for the /integrations controller: SIEM query/push, EDR adapters list,
 * threat-feed indicators. Matches SiemController in the backend blueprint.
 */
export const integrationsService = {
  async siemAdapters(): Promise<string[]> {
    if (!USE_MOCK) return (await api.get<{ adapters: string[] }>('/integrations/siem/adapters')).data.adapters;
    return ['splunk', 'elastic', 'sentinel'];
  },

  async querySiem(vendor: SiemVendor, query: string, earliest?: string): Promise<SiemQueryResult> {
    if (!USE_MOCK) return (await api.post<SiemQueryResult>('/integrations/siem/query', { vendor, query, earliest })).data;
    await wait(500);
    const rows = Array.from({ length: 5 }, (_, i) => ({
      _time: new Date(Date.now() - i * 60_000).toISOString(),
      host: `WKS-${100 + i}`,
      message: `Sample event ${i + 1} matching "${query}"`,
    }));
    return { vendor, query, rowCount: rows.length, rows, tookMs: 180 + Math.round(Math.random() * 300) };
  },

  async threatIndicators(feed: ThreatFeedSource = 'misp'): Promise<ThreatIndicator[]> {
    if (!USE_MOCK) return (await api.get<ThreatIndicator[]>('/integrations/threat-feeds/indicators', { feed })).data;
    await wait(300);
    return mockIndicators.filter((i) => i.feed === feed);
  },
};
