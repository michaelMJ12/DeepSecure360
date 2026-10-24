import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { Badge } from '@/components/ui/Badge';
import { auditService } from '@/services';
import type { AuditLog } from '@/types/models';
import { formatDateTime, humanize } from '@/utils/format';

const ACTIONS = ['LOGIN', 'CASE_CREATE', 'EVIDENCE_ACCESS', 'EVIDENCE_EXPORT', 'USER_UPDATE', 'ROLE_CHANGE'];

const columns: Column<AuditLog>[] = [
  { key: 'created_at', header: 'Time', sortable: true, render: (a) => formatDateTime(a.created_at) },
  { key: 'user_email', header: 'User', sortable: true },
  { key: 'action', header: 'Action', render: (a) => <Badge tone="info">{a.action}</Badge> },
  { key: 'resource_type', header: 'Resource', render: (a) => humanize(a.resource_type) },
  { key: 'resource_id', header: 'Resource ID', mono: true },
  { key: 'ip_address', header: 'IP address', mono: true },
];

export default function AuditLogsPage() {
  return (
    <ResourcePage<AuditLog>
      title="Audit logs"
      description="Append-only record of every sign-in, access and change."
      entityName="log entry"
      service={auditService}
      columns={columns}
      filters={[
        { key: 'action', label: 'Action', options: ACTIONS.map((a) => ({ value: a, label: a })) },
        { key: 'resource_type', label: 'Resource', options: ['user', 'case', 'evidence', 'role'].map((r) => ({ value: r, label: humanize(r) })) },
      ]}
      searchPlaceholder="Search by user, action, resource or IP"
      defaultSort={{ key: 'created_at', order: 'desc' }}
    />
  );
}
