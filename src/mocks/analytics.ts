import type { AnalyticsSnapshot, EvidenceByCase, RadarPoint, TimeBucket, TimeUnit } from '@/types/models';
import { mockCases, mockEvidence, mockJobs } from './data';

const MIN = 60_000;
const HOUR = 3_600_000;

export const UNIT_COUNT: Record<TimeUnit, number> = { year: 6, month: 12, day: 14, hour: 24, minute: 30, second: 30 };
const CATEGORIES = ['malware', 'phishing', 'insider_threat', 'data_breach', 'other'];

/** Deterministic noise so a given moment always produces the same number. */
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function startOf(unit: TimeUnit, now: number, back: number): Date {
  const d = new Date(now);
  switch (unit) {
    case 'year': return new Date(d.getFullYear() - back, 0, 1);
    case 'month': return new Date(d.getFullYear(), d.getMonth() - back, 1);
    case 'day': return new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);
    case 'hour': return new Date(Math.floor(now / HOUR) * HOUR - back * HOUR);
    case 'minute': return new Date(Math.floor(now / MIN) * MIN - back * MIN);
    default: return new Date(Math.floor(now / 1000) * 1000 - back * 1000);
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function labelFor(unit: TimeUnit, d: Date): string {
  switch (unit) {
    case 'year': return String(d.getFullYear());
    case 'month': return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    case 'day': return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
    case 'hour': return `${pad(d.getHours())}:00`;
    case 'minute': return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    default: return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}

const isActive = (s: string) => s !== 'closed' && s !== 'resolved';

const BASE = {
  active: mockCases.filter((c) => isActive(c.status)).length,
  critical: mockCases.filter((c) => c.severity === 'critical').length,
  evidence: mockEvidence.length,
  queued: mockJobs.filter((j) => j.status === 'queued').length,
  processing: mockJobs.filter((j) => j.status === 'processing').length,
  failed: mockJobs.filter((j) => j.status === 'failed').length,
};

function value(base: number, seedOffset: number, ts: number, unit: TimeUnit, i: number, n: number): number {
  if (i === n - 1) return base; // newest point is always the real current number
  const progress = i / (n - 1);
  const trend = unit === 'year' ? 0.3 + 0.7 * progress : unit === 'month' ? 0.65 + 0.35 * progress : 1;
  const noise = 0.65 + 0.7 * rand((ts / 1000) % 1_000_003 + seedOffset * 7919);
  return Math.max(0, Math.round(base * trend * noise));
}

function buildBuckets(unit: TimeUnit, now: number): TimeBucket[] {
  const n = UNIT_COUNT[unit];
  return Array.from({ length: n }, (_, i) => {
    const d = startOf(unit, now, n - 1 - i);
    const ts = d.getTime();
    return {
      ts,
      label: labelFor(unit, d),
      activeCases: value(BASE.active, 1, ts, unit, i, n),
      criticalCases: value(BASE.critical, 2, ts, unit, i, n),
      evidenceItems: value(BASE.evidence, 3, ts, unit, i, n),
      jobsQueued: value(BASE.queued, 4, ts, unit, i, n),
      jobsProcessing: value(BASE.processing, 5, ts, unit, i, n),
      jobsFailed: value(BASE.failed, 6, ts, unit, i, n),
    };
  });
}

/** Share of each category (lightly smoothed so no axis collapses to zero). */
function shares(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0) + 0.4 * counts.length;
  return counts.map((c) => (c + 0.4) / total);
}

function buildRadar(buckets: TimeBucket[]): RadarPoint[] {
  const mean = (pick: (b: TimeBucket) => number) => buckets.reduce((s, b) => s + pick(b), 0) / buckets.length;
  const byNumber = new Map(mockCases.map((c) => [c.case_number, c]));

  const activeShare = shares(CATEGORIES.map((c) => mockCases.filter((x) => x.category === c && isActive(x.status)).length));
  const criticalShare = shares(CATEGORIES.map((c) => mockCases.filter((x) => x.category === c && x.severity === 'critical').length));
  const evidenceShare = shares(CATEGORIES.map((c) => mockEvidence.filter((e) => byNumber.get(e.case_number)?.category === c).length));

  const mActive = mean((b) => b.activeCases);
  const mCritical = mean((b) => b.criticalCases);
  const mEvidence = mean((b) => b.evidenceItems);

  return CATEGORIES.map((category, i) => ({
    category,
    activeCases: Math.round(mActive * activeShare[i]),
    criticalCases: Math.round(mCritical * criticalShare[i]),
    evidenceItems: Math.round(mEvidence * evidenceShare[i]),
  }));
}

function buildEvidenceByCase(): EvidenceByCase[] {
  const counts = new Map<string, number>();
  mockEvidence.forEach((e) => counts.set(e.case_number, (counts.get(e.case_number) ?? 0) + 1));
  return mockCases
    .filter((c) => counts.has(c.case_number))
    .map((c) => ({ case_number: c.case_number, title: c.title, severity: c.severity, count: counts.get(c.case_number) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function buildMockAnalytics(unit: TimeUnit, now = Date.now()): AnalyticsSnapshot {
  const buckets = buildBuckets(unit, now);
  return { unit, buckets, radar: buildRadar(buckets), evidenceByCase: buildEvidenceByCase() };
}
