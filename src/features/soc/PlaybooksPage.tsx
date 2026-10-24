import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { FieldSchema } from '@/components/form/types';
import { playbookService } from '@/services/soc';
import type { Playbook } from '@/types/models';
import { formatDateTime } from '@/utils/format';

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'warning'> = { active: 'success', draft: 'neutral', retired: 'warning' };
const STATUSES = ['active', 'draft', 'retired'];
const CATEGORIES = ['Containment', 'Triage', 'Response', 'Automation'];

const columns: Column<Playbook>[] = [
  { key: 'name', header: 'Playbook', sortable: true },
  { key: 'trigger', header: 'Trigger' },
  { key: 'category', header: 'Category' },
  { key: 'status', header: 'Status', sortable: true, render: (p) => <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge> },
  { key: 'last_run', header: 'Last run', sortable: true, render: (p) => (p.last_run ? formatDateTime(p.last_run) : 'Never run') },
];

const schema: FieldSchema[] = [
  { name: 'name', label: 'Playbook name', type: 'text', required: true, maxLength: 150 },
  { name: 'trigger', label: 'Trigger', type: 'text', required: true, placeholder: 'e.g. Alert: Malware detected' },
  { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES.map((c) => ({ value: c, label: c })), colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map((s) => ({ value: s, label: s })), defaultValue: 'draft', colSpan: 1 },
];

export default function PlaybooksPage() {
  return (
    <ResourcePage<Playbook>
      title="Playbooks"
      description="Automated and manual response playbooks."
      entityName="playbook"
      service={playbookService}
      columns={columns}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: s })) },
        { key: 'category', label: 'Category', options: CATEGORIES.map((c) => ({ value: c, label: c })) },
      ]}
      formSchema={schema}
      allowDelete
      searchPlaceholder="Search by name, trigger or category"
      defaultSort={{ key: 'name', order: 'asc' }}
      rowLabel={(p) => p.name}
      toPayload={(v) => ({ ...v, last_run: null }) as unknown as Partial<Playbook>}
    />
  );
}
