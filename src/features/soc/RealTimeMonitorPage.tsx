import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import { AttackMap } from '@/components/geo/AttackMap';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getAttackEvents, alertService } from '@/services/soc';
import type { AttackEvent, SecurityAlert } from '@/types/models';
import { formatDateTime } from '@/utils/format';

export default function RealTimeMonitorPage() {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    getAttackEvents().then(setEvents);
    alertService.list({ page: 1, limit: 8, sortBy: 'time', sortOrder: 'desc' }).then((r) => setAlerts(r.items));
    const id = setInterval(() => {
      alertService.list({ page: 1, limit: 8, sortBy: 'time', sortOrder: 'desc' }).then((r) => setAlerts(r.items));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const critical = alerts.filter((a) => a.severity === 'critical').length;
  const newCount = alerts.filter((a) => a.status === 'new').length;

  return (
    <>
      <PageHeader title="Real-Time Monitor" description="Live view across alerts, traffic and attack paths." />
      <div className="stat-grid">
        <StatCard label="Alerts (recent)" value={alerts.length} icon="alert" />
        <StatCard label="Critical" value={critical} icon="alertCircle" tone="danger" />
        <StatCard label="New / unreviewed" value={newCount} icon="inbox" tone={newCount ? 'warning' : 'default'} />
        <StatCard label="Attack paths" value={events.length} icon="shield" />
      </div>
      <ChartCard theme="pulse" title="Real-time attack map" subtitle="Live aggregate attack traffic by city/region/country, refreshing automatically.">
        <AttackMap events={events} height={380} />
      </ChartCard>
      <div style={{ marginTop: 16 }}>
      <Card title="Recent alerts" flush>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Time</th><th>Alert</th><th>Severity</th><th>Source</th><th>Destination</th><th>Status</th></tr></thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.time)}</td>
                  <td>{a.alert_name}</td>
                  <td><StatusBadge value={a.severity} /></td>
                  <td className="mono">{a.source_ip}</td>
                  <td className="mono">{a.destination_ip}</td>
                  <td><Badge tone="info">{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </>
  );
}
