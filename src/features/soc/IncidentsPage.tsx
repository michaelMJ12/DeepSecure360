import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { incidentService } from '@/services/soc';
import type { SecurityIncident } from '@/types/models';
import { formatDateTime } from '@/utils/format';
import { SEVERITIES, toOptions } from '@/utils/options';

const STATUSES = ['new', 'investigating', 'contained', 'resolved'];

const columns: Column<SecurityIncident>[] = [
  { key: 'incident_number', header: 'Incident', sortable: true, mono: true, width: '130px' },
  { key: 'title', header: 'Title', sortable: true },
  { key: 'severity', header: 'Severity', sortable: true, render: (i) => <StatusBadge value={i.severity} /> },
  { key: 'assigned_to', header: 'Assigned to' },
  { key: 'status', header: 'Status', sortable: true, render: (i) => <StatusBadge value={i.status} /> },
  { key: 'opened_at', header: 'Opened', sortable: true, render: (i) => formatDateTime(i.opened_at) },
];

export default function IncidentsPage() {
  return (
    <ResourcePage<SecurityIncident>
      title="Incidents"
      description="Confirmed security incidents under active response."
      entityName="incident"
      service={incidentService}
      columns={columns}
      filters={[
        { key: 'severity', label: 'Severity', options: toOptions(SEVERITIES) },
        { key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
      ]}
      searchPlaceholder="Search by incident number, title or assignee"
      defaultSort={{ key: 'opened_at', order: 'desc' }}
      rowLabel={(i) => i.incident_number}
    />
  );
}
