import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { alertService } from '@/services/soc';
import type { SecurityAlert } from '@/types/models';
import { formatDateTime } from '@/utils/format';
import { SEVERITIES, toOptions } from '@/utils/options';

const STATUSES = ['new', 'investigating', 'resolved', 'dismissed'];

const columns: Column<SecurityAlert>[] = [
  { key: 'time', header: 'Time', sortable: true, render: (a) => formatDateTime(a.time) },
  { key: 'alert_name', header: 'Alert', sortable: true },
  { key: 'severity', header: 'Severity', sortable: true, render: (a) => <StatusBadge value={a.severity} /> },
  { key: 'source_ip', header: 'Source', mono: true },
  { key: 'destination_ip', header: 'Destination', mono: true },
  { key: 'status', header: 'Status', sortable: true, render: (a) => <StatusBadge value={a.status} /> },
];

export default function AlertsPage() {
  return (
    <ResourcePage<SecurityAlert>
      title="Alerts"
      description="Real-time security alerts across every connected sensor."
      entityName="alert"
      service={alertService}
      columns={columns}
      filters={[
        { key: 'severity', label: 'Severity', options: toOptions(SEVERITIES) },
        { key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
      ]}
      searchPlaceholder="Search by alert name, source or destination IP"
      defaultSort={{ key: 'time', order: 'desc' }}
      rowLabel={(a) => a.alert_name}
    />
  );
}
