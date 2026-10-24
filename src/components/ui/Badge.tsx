import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { humanize } from '@/utils/format';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'critical';

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn('badge', `badge-${tone}`)}>{children}</span>;
}

/** One place that decides which colour each status value gets. */
const TONES: Record<string, Tone> = {
  critical: 'critical', high: 'danger', medium: 'warning', low: 'info', info: 'neutral',
  open: 'info', in_progress: 'warning', pending_review: 'warning', resolved: 'success', closed: 'neutral',
  pending: 'neutral', scanning: 'info', quarantined: 'warning', clean: 'success', infected: 'critical',
  analyzing: 'info', analyzed: 'success',
  queued: 'neutral', processing: 'info', completed: 'success', failed: 'danger', cancelled: 'neutral',
  active: 'success', inactive: 'neutral',
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={TONES[value] ?? 'neutral'}>{humanize(value)}</Badge>;
}
