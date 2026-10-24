import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { BarLineChart } from '@/components/charts/BarLineChart';
import { ChartCard } from '@/components/charts/ChartCard';
import { HeartbeatChart } from '@/components/charts/HeartbeatChart';
import { RadarChart } from '@/components/charts/RadarChart';
import { TimeUnitTabs } from '@/components/charts/TimeUnitTabs';
import { useAnalytics } from '@/hooks/useAnalytics';
import { dashboardService } from '@/services/dashboardService';
import { errorMessage } from '@/services/apiClient';
import type { DashboardMetrics, Severity, TimeUnit } from '@/types/models';
import { formatDateTime, humanize } from '@/utils/format';

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: '#fb7185',
  high: '#fb923c',
  medium: '#fbbf24',
  low: '#38bdf8',
  info: '#94a3b8',
};

const UNIT_NOTE: Record<TimeUnit, string> = {
  year: 'Last 6 years',
  month: 'Last 12 months',
  day: 'Last 14 days',
  hour: 'Last 24 hours',
  minute: 'Last 30 minutes',
  second: 'Last 30 seconds',
};

export default function DashboardPage() {
  const [m, setM] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TimeUnit>('hour');
  const { snapshot, error: analyticsError } = useAnalytics(unit);

  useEffect(() => {
    dashboardService.getMetrics().then(setM).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert variant="error" title="Could not load the dashboard">{error}</Alert>;
  if (!m) return <div className="page-loading"><Spinner size={28} /></div>;

  const latest = snapshot?.buckets[snapshot.buckets.length - 1];
  const maxEvidence = Math.max(1, ...(snapshot?.evidenceByCase.map((e) => e.count) ?? [1]));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Current state of investigations, evidence and analysis. ${UNIT_NOTE[unit]}.`}
        actions={<TimeUnitTabs value={unit} onChange={setUnit} />}
      />

      <div className="stat-grid">
        <StatCard label="Active cases" value={m.openCases} icon="cases" />
        <StatCard label="Critical cases" value={m.criticalCases} icon="alert" tone="danger" />
        <StatCard label="Evidence items" value={m.evidenceItems} icon="evidence" note={`${m.quarantined} quarantined`} tone={m.quarantined ? 'warning' : 'default'} />
        <StatCard label="Jobs in progress" value={m.jobsRunning} icon="jobs" />
      </div>

      {analyticsError && <Alert variant="error" title="Could not load the graphs" className="chart-alert">{analyticsError}</Alert>}

      {snapshot && latest && (
        <>
          <div className="chart-grid">
            <ChartCard className="span-7" theme="indigo" title="Cases and evidence over time" subtitle={`Bars show active cases and evidence items. The line shows critical cases. ${UNIT_NOTE[unit]}.`}>
              <BarLineChart buckets={snapshot.buckets} />
            </ChartCard>
            <ChartCard className="span-5" theme="teal" title="Spread across case categories" subtitle="Evidence is counted under the category of the case it belongs to.">
              <RadarChart data={snapshot.radar} />
            </ChartCard>
          </div>

          <div className="chart-grid">
            <ChartCard className="span-12" theme="pulse" title="Jobs heartbeat" subtitle="Each trace beats faster and taller as its job count grows.">
              <HeartbeatChart
                unit={unit}
                series={[
                  { key: 'processing', label: 'Processing', color: '#34d399', value: latest.jobsProcessing },
                  { key: 'queued', label: 'Queued', color: '#fbbf24', value: latest.jobsQueued },
                  { key: 'failed', label: 'Failed', color: '#fb7185', value: latest.jobsFailed },
                ]}
              />
            </ChartCard>
          </div>

          <div className="chart-grid">
            <ChartCard className="span-5" theme="plum" title="Evidence by case" subtitle="Cases holding the most evidence items.">
              <ul className="case-bars">
                {snapshot.evidenceByCase.map((e) => (
                  <li key={e.case_number}>
                    <div className="case-bars-head">
                      <span className="mono">{e.case_number}</span>
                      <span className="case-bars-title" title={e.title}>{e.title}</span>
                      <b>{e.count}</b>
                    </div>
                    <span className="case-bars-track">
                      <span className="case-bars-fill" style={{ width: `${(e.count / maxEvidence) * 100}%`, background: `linear-gradient(90deg, ${SEVERITY_COLOR[e.severity]}, #c084fc)` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </ChartCard>

            <Card title="Recent activity" flush className="span-7">
              <div className="table-scroll">
                <table className="table">
                  <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th></tr></thead>
                  <tbody>
                    {m.recentAudit.map((a) => (
                      <tr key={a.id}>
                        <td>{formatDateTime(a.created_at)}</td>
                        <td>{a.user_email}</td>
                        <td><Badge tone="info">{a.action}</Badge></td>
                        <td>{humanize(a.resource_type)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
      {!snapshot && !analyticsError && <div className="page-loading"><Spinner size={28} /></div>}
    </>
  );
}
