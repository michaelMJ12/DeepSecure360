import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { Badge } from '@/components/ui/Badge';
import { endpointService } from '@/services/soc';
import type { EndpointAsset } from '@/types/models';
import { formatDateTime } from '@/utils/format';

const AGENT_TONE: Record<string, 'success' | 'warning' | 'danger'> = { connected: 'success', degraded: 'warning', offline: 'danger' };
const AGENT_STATUSES = ['connected', 'degraded', 'offline'];

const columns: Column<EndpointAsset>[] = [
  { key: 'hostname', header: 'Host', sortable: true, mono: true },
  { key: 'os', header: 'OS' },
  { key: 'ip', header: 'IP', mono: true },
  { key: 'agent_status', header: 'Agent', sortable: true, render: (e) => <Badge tone={AGENT_TONE[e.agent_status]}>{e.agent_status}</Badge> },
  { key: 'risk_score', header: 'Risk score', sortable: true, align: 'right', render: (e) => <Badge tone={e.risk_score > 70 ? 'danger' : e.risk_score > 40 ? 'warning' : 'success'}>{e.risk_score}</Badge> },
  { key: 'last_seen', header: 'Last seen', sortable: true, render: (e) => formatDateTime(e.last_seen) },
];

export default function EndpointSecurityPage() {
  return (
    <ResourcePage<EndpointAsset>
      title="Endpoint Security"
      description="Agents and risk posture across monitored workstations and servers."
      entityName="endpoint"
      service={endpointService}
      columns={columns}
      filters={[{ key: 'agent_status', label: 'Agent', options: AGENT_STATUSES.map((s) => ({ value: s, label: s })) }]}
      searchPlaceholder="Search by hostname, OS or IP"
      defaultSort={{ key: 'risk_score', order: 'desc' }}
      rowLabel={(e) => e.hostname}
    />
  );
}
