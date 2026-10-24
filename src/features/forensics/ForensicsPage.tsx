import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { forensicScanService } from '@/services';
import type { ForensicScan } from '@/types/models';
import { formatDateTime, humanize } from '@/utils/format';
import { SCAN_ENGINES, SCAN_STATUSES, SCAN_TARGETS, SCAN_VERDICTS, toOptions } from '@/utils/options';

const VERDICT_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  clean: 'success', suspicious: 'warning', malicious: 'danger', inconclusive: 'neutral',
};

const columns: Column<ForensicScan>[] = [
  { key: 'evidence_number', header: 'Evidence', sortable: true, mono: true },
  { key: 'case_number', header: 'Case', mono: true },
  { key: 'engine', header: 'Engine', render: (s) => <Badge tone="info">{s.engine.toUpperCase()}</Badge> },
  { key: 'target', header: 'Target', render: (s) => humanize(s.target) },
  { key: 'status', header: 'Status', sortable: true, render: (s) => <StatusBadge value={s.status} /> },
  { key: 'verdict', header: 'Verdict', render: (s) => (s.verdict ? <Badge tone={VERDICT_TONE[s.verdict]}>{humanize(s.verdict)}</Badge> : '—') },
  { key: 'matched_rules', header: 'Matched rules', render: (s) => (s.matched_rules.length ? s.matched_rules.join(', ') : '—') },
  { key: 'duration_ms', header: 'Duration', align: 'right', render: (s) => (s.duration_ms === null ? '—' : `${(s.duration_ms / 1000).toFixed(1)} s`) },
  { key: 'created_at', header: 'Started', sortable: true, render: (s) => formatDateTime(s.created_at) },
];

/** Security & Forensics Engine module (rule engine + sandboxed scan workers in the blueprint). */
export default function ForensicsPage() {
  return (
    <ResourcePage<ForensicScan>
      title="Forensics"
      description="YARA / Sigma / custom rule scans run against evidence in sandboxed workers."
      entityName="scan"
      service={forensicScanService}
      columns={columns}
      filters={[
        { key: 'engine', label: 'Engine', options: toOptions(SCAN_ENGINES) },
        { key: 'target', label: 'Target', options: toOptions(SCAN_TARGETS) },
        { key: 'status', label: 'Status', options: toOptions(SCAN_STATUSES) },
        { key: 'verdict', label: 'Verdict', options: toOptions(SCAN_VERDICTS) },
      ]}
      searchPlaceholder="Search by case, evidence, engine or target"
      defaultSort={{ key: 'created_at', order: 'desc' }}
      rowLabel={(s) => s.evidence_number}
    />
  );
}
