import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/form/Select';
import { Textarea } from '@/components/form/Textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { errorMessage } from '@/services/apiClient';
import { integrationsService, type SiemQueryResult } from '@/services/integrationsService';
import type { SiemVendor } from '@/types/models';
import { SIEM_VENDORS, toOptions } from '@/utils/options';

export default function SiemSearchPage() {
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
    <>
      <PageHeader title="SIEM Search" description="Run ad-hoc searches against a connected SIEM." />
      <Card title="Query">
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
    </>
  );
}
