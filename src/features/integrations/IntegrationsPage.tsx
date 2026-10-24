import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/form/Select';
import { Textarea } from '@/components/form/Textarea';
import { DataTable, type Column } from '@/components/data/DataTable';
import { ThreatGlobe } from '@/components/globe/ThreatGlobe';
import { ChartCard } from '@/components/charts/ChartCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { useList } from '@/hooks/useList';
import { edrAlertService, webhookEventService } from '@/services';
import { errorMessage } from '@/services/apiClient';
import { integrationsService, type SiemQueryResult } from '@/services/integrationsService';
import type { EdrAlert, SiemVendor, ThreatFeedSource, ThreatIndicator, WebhookEvent } from '@/types/models';
import { cn } from '@/utils/cn';
import { formatDateTime, humanize } from '@/utils/format';
import { EDR_VENDORS, SIEM_VENDORS, THREAT_FEEDS, toOptions } from '@/utils/options';

type Tab = 'siem' | 'edr' | 'threat-intel' | 'webhooks';
const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'siem', label: 'SIEM query' },
  { key: 'edr', label: 'EDR alerts' },
  { key: 'threat-intel', label: 'Threat intel globe' },
  { key: 'webhooks', label: 'Webhook events' },
];

function SiemPanel() {
  const [vendor, setVendor] = useState<SiemVendor>('splunk');
  const [query, setQuery] = useState('index=security sourcetype=firewall action=blocked');
  const [result, setResult] = useState<SiemQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await integrationsService.querySiem(vendor, query));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Query a connected SIEM" className="span-12">
      <div className="siem-panel">
        <Select label="Vendor" options={toOptions(SIEM_VENDORS)} value={vendor} onChange={(e) => setVendor(e.target.value as SiemVendor)} />
        <Textarea label="Search query" value={query} onChange={(e) => setQuery(e.target.value)} rows={3} />
        <Button icon="search" loading={busy} onClick={() => void run()}>Run query</Button>
      </div>
      {error && <Alert variant="error" title="Query failed" className="form-alert">{error}</Alert>}
      {result && (
        <div className="table-scroll" style={{ marginTop: 14 }}>
          <p className="siem-meta">{result.rowCount} rows · {result.tookMs} ms · POST /integrations/siem/query</p>
          <table className="table">
            <thead><tr>{Object.keys(result.rows[0] ?? {}).map((k) => <th key={k}>{k}</th>)}</tr></thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="mono">{v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function EdrPanel() {
  const [page, setPage] = useState(1);
  const { items, meta, loading, error, reload } = useList(edrAlertService, { page, limit: 10, sortBy: 'created_at', sortOrder: 'desc' });
  const columns: Column<EdrAlert>[] = [
    { key: 'hostname', header: 'Host', sortable: true, mono: true },
    { key: 'vendor', header: 'Vendor', render: (a) => <Badge tone="info">{humanize(a.vendor)}</Badge> },
    { key: 'technique', header: 'MITRE technique', mono: true },
    { key: 'severity', header: 'Severity', sortable: true, render: (a) => <StatusBadge value={a.severity} /> },
    { key: 'status', header: 'Status', sortable: true, render: (a) => <StatusBadge value={a.status} /> },
    { key: 'created_at', header: 'Detected', sortable: true, render: (a) => formatDateTime(a.created_at) },
  ];
  return (
    <Card title="EDR alerts" className="span-12" flush actions={<Select label="" options={toOptions(EDR_VENDORS)} defaultValue="crowdstrike" />}>
      <DataTable columns={columns} rows={items} meta={meta} loading={loading} error={error} onRetry={reload} onPageChange={setPage} emptyTitle="No alerts" />
    </Card>
  );
}

function ThreatIntelPanel() {
  const [feed, setFeed] = useState<ThreatFeedSource>('misp');
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [selected, setSelected] = useState<ThreatIndicator | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    integrationsService.threatIndicators(feed).then(setIndicators).catch((e) => setError(errorMessage(e)));
  }, [feed]);

  return (
    <div className="chart-grid">
      <ChartCard
        className="span-7"
        theme="indigo"
        title="Threat indicator origins"
        subtitle="Aggregate, country-level geolocation reported by the sensor network behind each feed. Drag to rotate."
        actions={<Select label="" options={toOptions(THREAT_FEEDS)} value={feed} onChange={(e) => setFeed(e.target.value as ThreatFeedSource)} />}
      >
        {error ? <Alert variant="error" title="Could not load indicators">{error}</Alert> : <ThreatGlobe indicators={indicators} onSelect={setSelected} />}
      </ChartCard>
      <Card title={selected ? 'Indicator detail' : `${indicators.length} indicators from ${feed.toUpperCase()}`} className="span-5">
        {selected ? (
          <dl className="ioc-detail">
            <div><dt>Value</dt><dd className="mono">{selected.value}</dd></div>
            <div><dt>Type</dt><dd>{humanize(selected.type)}</dd></div>
            <div><dt>Feed</dt><dd>{selected.feed.toUpperCase()}</dd></div>
            <div><dt>Reputation score</dt><dd>{selected.score} / 100</dd></div>
            <div><dt>Country</dt><dd>{selected.country}</dd></div>
            <div><dt>First seen</dt><dd>{formatDateTime(selected.first_seen)}</dd></div>
            <div><dt>Tags</dt><dd>{selected.tags.map((t) => <Badge key={t} tone="warning">{t}</Badge>)}</dd></div>
          </dl>
        ) : (
          <p className="muted-note">Hover a point on the globe to see indicator details. This shows feed-level reputation data only — never a live location for a specific person.</p>
        )}
      </Card>
    </div>
  );
}

function WebhooksPanel() {
  const [page, setPage] = useState(1);
  const { items, meta, loading, error, reload } = useList(webhookEventService, { page, limit: 10, sortBy: 'received_at', sortOrder: 'desc' });
  const columns: Column<WebhookEvent>[] = [
    { key: 'received_at', header: 'Received', sortable: true, render: (w) => formatDateTime(w.received_at) },
    { key: 'source', header: 'Source', render: (w) => <Badge tone="info">{humanize(w.source)}</Badge> },
    { key: 'event', header: 'Event', mono: true },
    { key: 'organization_id', header: 'Org', mono: true },
    { key: 'signature_valid', header: 'Signature', render: (w) => <Badge tone={w.signature_valid ? 'success' : 'danger'}>{w.signature_valid ? 'Valid' : 'Invalid'}</Badge> },
  ];
  return (
    <Card title="Inbound webhook events" className="span-12" flush>
      <DataTable columns={columns} rows={items} meta={meta} loading={loading} error={error} onRetry={reload} onPageChange={setPage} emptyTitle="No webhook events yet" />
    </Card>
  );
}

/** Mirrors the /integrations and /webhooks controllers in the backend blueprint. */
export default function IntegrationsPage() {
  const [tab, setTab] = useState<Tab>('threat-intel');
  return (
    <>
      <PageHeader title="Integrations" description="SIEM, EDR, threat-intel feeds and inbound webhooks." />
      <div className="seg integ-tabs" role="tablist" aria-label="Integration sections">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={cn(tab === t.key && 'is-active')} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'siem' && <SiemPanel />}
      {tab === 'edr' && <EdrPanel />}
      {tab === 'threat-intel' && <ThreatIntelPanel />}
      {tab === 'webhooks' && <WebhooksPanel />}
    </>
  );
}
