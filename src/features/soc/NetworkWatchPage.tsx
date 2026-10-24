import { useEffect, useState } from 'react';
import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ChartCard } from '@/components/charts/ChartCard';
import { AttackMap } from '@/components/geo/AttackMap';
import { PageHeader } from '@/components/layout/PageHeader';
import { connectionService, getAttackEvents } from '@/services/soc';
import type { AttackEvent, NetworkConnection } from '@/types/models';
import { formatBytes, formatDateTime } from '@/utils/format';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = { allowed: 'success', flagged: 'warning', blocked: 'danger' };
const STATUSES = ['allowed', 'flagged', 'blocked'];

const columns: Column<NetworkConnection>[] = [
  { key: 'created_at', header: 'Time', sortable: true, render: (c) => formatDateTime(c.created_at) },
  { key: 'src_ip', header: 'Source', mono: true, render: (c) => <span className="mono">{c.src_ip}</span> },
  { key: 'src_city', header: 'From', render: (c) => `${c.src_city}, ${c.src_country}` },
  { key: 'dst_city', header: 'To', render: (c) => `${c.dst_city}, ${c.dst_country}` },
  { key: 'protocol', header: 'Protocol', mono: true },
  { key: 'bytes', header: 'Volume', align: 'right', render: (c) => formatBytes(c.bytes) },
  { key: 'status', header: 'Status', sortable: true, render: (c) => <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge> },
];

export default function NetworkWatchPage() {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  useEffect(() => { getAttackEvents().then(setEvents); }, []);

  return (
    <>
      <PageHeader title="Network Watch" description="Live network traffic and point-to-point attack paths, by city and country." />
      <ChartCard theme="indigo" title="Live attack map" subtitle="Each line is aggregate traffic between a reporting city/region and an asset site. Click a point to zoom in; coordinates never resolve to a street address or a specific device.">
        <AttackMap events={events} />
      </ChartCard>
      <div style={{ marginTop: 16 }}>
        <ResourcePage<NetworkConnection>
          title="Connections"
          description="Individual flows behind the map above."
          entityName="connection"
          service={connectionService}
          columns={columns}
          filters={[{ key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: s })) }]}
          searchPlaceholder="Search by IP or city"
          defaultSort={{ key: 'created_at', order: 'desc' }}
        />
      </div>
    </>
  );
}
