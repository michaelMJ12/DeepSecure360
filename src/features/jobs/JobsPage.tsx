import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { jobService } from '@/services';
import type { AnalysisJob } from '@/types/models';
import { formatDateTime, humanize } from '@/utils/format';
import { JOB_STATUSES, JOB_TYPES, toOptions } from '@/utils/options';

const columns: Column<AnalysisJob>[] = [
  { key: 'case_number', header: 'Case', sortable: true, mono: true },
  { key: 'job_type', header: 'Job', render: (j) => humanize(j.job_type) },
  { key: 'status', header: 'Status', sortable: true, render: (j) => <StatusBadge value={j.status} /> },
  { key: 'model_used', header: 'Model' },
  { key: 'prompt_version', header: 'Prompt', mono: true },
  { key: 'confidence_score', header: 'Confidence', align: 'right', render: (j) => (j.confidence_score === null ? '—' : `${Math.round(j.confidence_score * 100)}%`) },
  { key: 'processing_time_ms', header: 'Duration', align: 'right', render: (j) => (j.processing_time_ms === null ? '—' : `${(j.processing_time_ms / 1000).toFixed(1)} s`) },
  { key: 'created_at', header: 'Queued', sortable: true, render: (j) => formatDateTime(j.created_at) },
];

export default function JobsPage() {
  return (
    <ResourcePage<AnalysisJob>
      title="Analysis jobs"
      description="AI and forensic analysis queued across all cases."
      entityName="job"
      service={jobService}
      columns={columns}
      filters={[
        { key: 'status', label: 'Status', options: toOptions(JOB_STATUSES) },
        { key: 'job_type', label: 'Job type', options: toOptions(JOB_TYPES) },
      ]}
      searchPlaceholder="Search by case, job type or model"
      defaultSort={{ key: 'created_at', order: 'desc' }}
    />
  );
}
