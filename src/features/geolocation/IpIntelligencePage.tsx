import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/form/Input';
import { DataTable, type Column } from '@/components/data/DataTable';
import { GeoAccuracyMap } from '@/components/geo/GeoAccuracyMap';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useList } from '@/hooks/useList';
import { useToast } from '@/context/ToastContext';
import { errorMessage } from '@/services/apiClient';
import { geoService, ipLookupHistoryService, type GeoRaw } from '@/services/geoService';
import type { IpGeoLookup } from '@/types/models';
import { formatDateTime } from '@/utils/format';

const HISTORY_COLUMNS: Column<IpGeoLookup>[] = [
  { key: 'ip', header: 'IP address', mono: true },
  { key: 'city', header: 'City', sortable: true },
  { key: 'region', header: 'Region', sortable: true },
  { key: 'country', header: 'Country', sortable: true },
  { key: 'org', header: 'Org / ASN' },
  { key: 'looked_up_by', header: 'Looked up by' },
  { key: 'looked_up_at', header: 'When', sortable: true, render: (r) => formatDateTime(r.looked_up_at) },
];

export default function IpIntelligencePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [ip, setIp] = useState('197.211.63.207');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<GeoRaw | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const { items, meta, loading, error: historyError, reload } = useList(ipLookupHistoryService, {
    page, limit: 8, sortBy: 'looked_up_at', sortOrder: 'desc',
  });

  const runLookup = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await geoService.lookup(ip));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const saveToHistory = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await ipLookupHistoryService.create({
        ...result,
        looked_up_by: user ? `${user.first_name} ${user.last_name}` : 'Unknown analyst',
        looked_up_at: new Date().toISOString(),
        note,
      } as Partial<IpGeoLookup>);
      toast.success('Saved to lookup history');
      setNote('');
      reload();
    } catch (e) {
      toast.error('Could not save', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const [lat, lng] = result ? result.loc.split(',').map(Number) : [0, 0];

  return (
    <>
      <PageHeader title="IP Intelligence" description="City-level geolocation lookups for an IP seen in a case or alert." />

      <Alert variant="info" title="What this shows — and doesn't" className="form-alert">
        City, region, country, network owner and timezone, accurate to roughly the radius shown on the map — this is
        how IP geolocation actually works. It cannot resolve a street address, a live device position, a photo of
        whoever is using the IP, or their social media activity, because an IP address doesn't carry that information.
      </Alert>

      <div className="chart-grid">
        <Card className="span-5" title="Look up an IP">
          <div className="geo-form">
            <Input label="IP address" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="e.g. 197.211.63.207" icon="search" />
            <Button icon="search" loading={busy} onClick={() => void runLookup()}>Look up</Button>
          </div>
          {error && <Alert variant="error" title="Lookup failed" className="form-alert">{error}</Alert>}

          {result && (
            <>
              <dl className="ioc-detail" style={{ marginTop: 16 }}>
                <div><dt>IP</dt><dd className="mono">{result.ip}</dd></div>
                <div><dt>City</dt><dd>{result.city}</dd></div>
                <div><dt>Region</dt><dd>{result.region}</dd></div>
                <div><dt>Country</dt><dd>{result.country}</dd></div>
                <div><dt>Org / ASN</dt><dd>{result.org}</dd></div>
                <div><dt>Timezone</dt><dd>{result.timezone}</dd></div>
                <div><dt>Coordinates</dt><dd className="mono">{result.loc}</dd></div>
                <div><dt>Accuracy</dt><dd><Badge tone="warning">~{result.accuracy_radius_km} km radius</Badge></dd></div>
              </dl>
              <div className="geo-save">
                <Input label="Case note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Source IP on case DS360-2026-0004" />
                <Button variant="secondary" icon="plus" loading={saving} onClick={() => void saveToHistory()}>Save to history</Button>
              </div>
            </>
          )}
        </Card>

        <Card className="span-7" title={result ? `Approximate area: ${result.city}, ${result.country}` : 'Approximate area'} flush>
          {result ? (
            <GeoAccuracyMap lat={lat} lng={lng} city={result.city} accuracyKm={result.accuracy_radius_km} />
          ) : (
            <div className="empty"><p className="muted-note">Run a lookup to see its approximate area.</p></div>
          )}
        </Card>
      </div>

      <Card title="Lookup history" flush>
        <DataTable
          columns={HISTORY_COLUMNS}
          rows={items}
          meta={meta}
          loading={loading}
          error={historyError}
          onRetry={reload}
          onPageChange={setPage}
          emptyTitle="No lookups saved yet"
          emptyDescription="Lookups you save appear here for case reference."
        />
      </Card>
    </>
  );
}
