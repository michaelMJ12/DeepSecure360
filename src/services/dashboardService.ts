import type { CaseStatus, DashboardMetrics, Severity } from '@/types/models';
import { mockAudit, mockCases, mockEvidence, mockJobs } from '@/mocks/data';
import { api } from './apiClient';
import { USE_MOCK } from './resourceService';

function countBy<K extends string>(keys: readonly K[], values: K[]): Record<K, number> {
  const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
  values.forEach((v) => (out[v] += 1));
  return out;
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    if (!USE_MOCK) return (await api.get<DashboardMetrics>('/dashboard/metrics')).data;
    await new Promise((r) => setTimeout(r, 300));
    return {
      openCases: mockCases.filter((c) => c.status !== 'closed' && c.status !== 'resolved').length,
      criticalCases: mockCases.filter((c) => c.severity === 'critical').length,
      evidenceItems: mockEvidence.length,
      quarantined: mockEvidence.filter((e) => e.status === 'quarantined').length,
      jobsRunning: mockJobs.filter((j) => j.status === 'processing' || j.status === 'queued').length,
      casesBySeverity: countBy<Severity>(['critical', 'high', 'medium', 'low', 'info'], mockCases.map((c) => c.severity)),
      casesByStatus: countBy<CaseStatus>(['open', 'in_progress', 'pending_review', 'resolved', 'closed'], mockCases.map((c) => c.status)),
      recentAudit: mockAudit.slice(0, 6),
    };
  },
};
