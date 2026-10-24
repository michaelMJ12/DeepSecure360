import type { AnalyticsSnapshot, TimeUnit } from '@/types/models';
import { buildMockAnalytics } from '@/mocks/analytics';
import { api } from './apiClient';
import { USE_MOCK } from './resourceService';

export const analyticsService = {
  async get(unit: TimeUnit): Promise<AnalyticsSnapshot> {
    if (!USE_MOCK) return (await api.get<AnalyticsSnapshot>('/dashboard/analytics', { unit })).data;
    return buildMockAnalytics(unit);
  },
};
