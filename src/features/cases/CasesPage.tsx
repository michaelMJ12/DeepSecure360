import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import type { FieldSchema } from '@/components/form/types';
import { StatusBadge } from '@/components/ui/Badge';
import { caseService } from '@/services';
import { USE_MOCK } from '@/services/resourceService';
import type { Case } from '@/types/models';
import { formatDate, humanize } from '@/utils/format';
import { CASE_CATEGORIES, CASE_STATUSES, SEVERITIES, toOptions } from '@/utils/options';

const columns: Column<Case>[] = [
  { key: 'case_number', header: 'Case', sortable: true, mono: true, width: '150px' },
  { key: 'title', header: 'Title', sortable: true },
  { key: 'severity', header: 'Severity', sortable: true, render: (c) => <StatusBadge value={c.severity} /> },
  { key: 'status', header: 'Status', sortable: true, render: (c) => <StatusBadge value={c.status} /> },
  { key: 'category', header: 'Category', render: (c) => humanize(c.category) },
  { key: 'assigned_to', header: 'Assigned to' },
  { key: 'sla_deadline', header: 'SLA deadline', sortable: true, render: (c) => formatDate(c.sla_deadline) },
];

const schema: FieldSchema[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, maxLength: 255 },
  { name: 'severity', label: 'Severity', type: 'select', required: true, options: toOptions(SEVERITIES), colSpan: 1 },
  { name: 'category', label: 'Category', type: 'select', required: true, options: toOptions(CASE_CATEGORIES), colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: toOptions(CASE_STATUSES), defaultValue: 'open', colSpan: 1 },
  { name: 'sla_deadline', label: 'SLA deadline', type: 'date', colSpan: 1 },
  { name: 'assigned_to', label: 'Assignee email', type: 'email', hint: 'Leave empty to keep the case unassigned.' },
  { name: 'description', label: 'Description', type: 'textarea', maxLength: 2000 },
];

export default function CasesPage() {
  return (
    <ResourcePage<Case>
      title="Cases"
      description="Incidents and investigations across your organization."
      entityName="case"
      service={caseService}
      columns={columns}
      filters={[
        { key: 'severity', label: 'Severity', options: toOptions(SEVERITIES) },
        { key: 'status', label: 'Status', options: toOptions(CASE_STATUSES) },
        { key: 'category', label: 'Category', options: toOptions(CASE_CATEGORIES) },
      ]}
      formSchema={schema}
      allowDelete
      searchPlaceholder="Search by case number, title or assignee"
      defaultSort={{ key: 'case_number', order: 'desc' }}
      rowLabel={(c) => c.case_number}
      toFormValues={(c) => ({ ...c, sla_deadline: c.sla_deadline?.slice(0, 10) ?? '' }) as never}
      toPayload={(v, existing) => ({
        ...v,
        sla_deadline: v.sla_deadline ? new Date(String(v.sla_deadline)).toISOString() : null,
        // The real API generates case numbers (DS360-YYYY-NNNN). Mock mode fakes one.
        ...(USE_MOCK && !existing ? { case_number: `DS360-2026-${String(Math.floor(Math.random() * 9000) + 1000)}` } : {}),
      }) as unknown as Partial<Case>}
    />
  );
}
