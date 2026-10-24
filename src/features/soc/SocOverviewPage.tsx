import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { DonutChart } from '@/components/charts/DonutChart';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { AttackMap } from '@/components/geo/AttackMap';
import { getAttackEvents } from '@/services/soc';
import type { AttackEvent } from '@/types/models';
import {
  ALERT_DISTRIBUTION_TOTAL, ATTACK_TYPES_TOTAL, mockAlertDistribution, mockAttackTypes,
  mockOverviewAlerts, mockOverviewRecentCases, mockOverviewStats, mockSystemStatus,
  mockThreatFeedTicker, mockTopCountries,
} from '@/mocks/soc';

const ACCENT_HEX: Record<string, string> = { red: '#f43f5e', orange: '#fb923c', purple: '#a78bfa', blue: '#38bdf8', green: '#34d399' };
const SEV_DOT: Record<string, string> = { critical: '#f43f5e', high: '#fb923c', medium: '#fbbf24' };

export default function SocOverviewPage() {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  useEffect(() => { getAttackEvents().then(setEvents); }, []);

  const maxCountry = Math.max(...mockTopCountries.map((c) => c.count));

  return (
    <div className="soc-overview">
      <div className="ov-stat-row">
        {mockOverviewStats.map((s) => (
          <div key={s.key} className={`ov-stat ov-stat--${s.accent}`}>
            <div className="ov-stat-head">
              <span className="ov-stat-icon"><Icon name={s.icon} size={18} /></span>
              <span className="ov-stat-label">{s.label}</span>
            </div>
            <div className="ov-stat-body">
              <strong className="ov-stat-value">{s.value}</strong>
              <MiniSparkline series={s.series} color={ACCENT_HEX[s.accent]} />
            </div>
            <span className={`ov-stat-trend ${s.trendUp ? 'is-up' : 'is-down'}`}>
              {s.trendUp ? '↑' : '↓'} {s.trendPct}% vs last 24h
            </span>
          </div>
        ))}
      </div>

      <div className="ov-grid">
        <Card
          className="ov-span-8"
          flush
          title="Real-time Attack Map"
          actions={<button type="button" className="ov-range-btn">Last 24 Hours <Icon name="chevronDown" size={14} /></button>}
        >
          <div className="ov-map-layout">
            <div className="ov-map-side">
              <p className="ov-sublabel">Top Attacking Countries</p>
              <ul className="ov-country-list">
                {mockTopCountries.map((c) => (
                  <li key={c.country}>
                    <div className="ov-country-row">
                      <span>{c.country}</span>
                      <b>{c.count}</b>
                    </div>
                    <span className="ov-country-track"><span className="ov-country-fill" style={{ width: `${(c.count / maxCountry) * 100}%` }} /></span>
                  </li>
                ))}
              </ul>

              <p className="ov-sublabel" style={{ marginTop: 18 }}>Attack Types</p>
              <div className="ov-donut-row">
                <DonutChart slices={mockAttackTypes} total={ATTACK_TYPES_TOTAL} totalLabel="Total" size={96} thickness={14} />
                <ul className="ov-legend-list">
                  {mockAttackTypes.map((t) => (
                    <li key={t.label}><i style={{ background: t.color }} />{t.label}<b>{t.pct}%</b></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ov-map-main">
              <AttackMap events={events} height={360} />
            </div>
          </div>
        </Card>

        <div className="ov-span-4 ov-right-col">
          <Card title="Alert Distribution">
            <div className="ov-donut-row ov-donut-row--center">
              <DonutChart slices={mockAlertDistribution} total={ALERT_DISTRIBUTION_TOTAL} totalLabel="Total" />
              <ul className="ov-legend-list ov-legend-list--boxed">
                {mockAlertDistribution.map((d) => (
                  <li key={d.label}><i style={{ background: d.color }} />{d.label}<b>{d.count} ({d.pct}%)</b></li>
                ))}
              </ul>
            </div>
          </Card>

          <Card title="System Status">
            <ul className="ov-status-list">
              {mockSystemStatus.map((s) => (
                <li key={s.name}><span>{s.name}</span><span className="ov-status-ok"><i />{s.status}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="ov-grid">
        <Card className="ov-span-8" flush title="Recent Alerts" actions={<a className="ov-view-all" href="#/soc/alerts">View all alerts →</a>}>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Time</th><th>Alert Name</th><th>Severity</th><th>Source</th><th>Destination</th><th>Status</th></tr></thead>
              <tbody>
                {mockOverviewAlerts.map((a, i) => (
                  <tr key={i}>
                    <td className="mono">{a.time}</td>
                    <td>{a.alert_name}</td>
                    <td><span className="ov-sev" style={{ color: SEV_DOT[a.severity] }}><i style={{ background: SEV_DOT[a.severity] }} />{a.severity[0].toUpperCase() + a.severity.slice(1)}</span></td>
                    <td className="mono">{a.source}</td>
                    <td className="mono">{a.destination}</td>
                    <td><span className="ov-status-pill">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="ov-span-4" flush title="Recent Cases" actions={<a className="ov-view-all" href="#/soc/case-management">View all →</a>}>
          <ul className="ov-case-list">
            {mockOverviewRecentCases.map((c) => (
              <li key={c.case_number}>
                <div>
                  <strong>{c.title}</strong>
                  <span className="ov-case-meta">{c.case_number}</span>
                </div>
                <div className="ov-case-right">
                  <span className="ov-sev" style={{ color: SEV_DOT[c.severity] }}><i style={{ background: SEV_DOT[c.severity] }} />{c.severity[0].toUpperCase() + c.severity.slice(1)}</span>
                  <span className="ov-case-ago">{c.ago}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="ov-ticker">
        <span className="ov-ticker-badge">Threat Intelligence Feed <b>{mockThreatFeedTicker.length}</b></span>
        <div className="ov-ticker-items">
          {mockThreatFeedTicker.map((t, i) => (
            <span key={i} className="ov-ticker-item">
              {i > 0 && <i className="ov-ticker-sep" />}
              {t}
            </span>
          ))}
        </div>
        <a className="ov-view-all" href="#/soc/threat-intelligence">View all →</a>
      </div>
    </div>
  );
}
