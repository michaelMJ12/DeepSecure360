import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChartCard } from '@/components/charts/ChartCard';
import { GeoAccuracyMap } from '@/components/geo/GeoAccuracyMap';
import { PageHeader } from '@/components/layout/PageHeader';
import { Satellite3D } from '@/components/satellite/Satellite3D';
import { SatelliteTerminal } from '@/components/satellite/SatelliteTerminal';
import { satelliteService } from '@/services/satelliteService';
import type { SatelliteInfo, SatelliteLinkStatus } from '@/types/models';
import { formatDateTime } from '@/utils/format';

const STATUS_LABEL: Record<SatelliteLinkStatus, string> = { idle: 'Idle', acquiring: 'Acquiring…', connected: 'Connected', lost: 'Link lost' };
const STATUS_TONE: Record<SatelliteLinkStatus, 'neutral' | 'warning' | 'success' | 'danger'> = { idle: 'neutral', acquiring: 'warning', connected: 'success', lost: 'danger' };

export default function SatelliteUplinkPage() {
  const [status, setStatus] = useState<SatelliteLinkStatus>('idle');
  const [satellites, setSatellites] = useState<SatelliteInfo[]>([]);

  useEffect(() => {
    satelliteService.list().then(setSatellites);
  }, []);

  return (
    <>
      <PageHeader title="Satellite Uplink" description="Public orbital telemetry — satellite tracking, not people tracking." />
      <Alert variant="info" title="What this does — and doesn't" className="form-alert">
        This connects to publicly published satellite orbital data (which satellite, its altitude, and when it next
        passes over a region). It does not and cannot locate a specific person, pull a photo, or show someone's
        device or social media activity — no satellite uplink, lawful or otherwise, works that way for a third party.
      </Alert>

      <div className="chart-grid">
        <ChartCard className="span-5" theme="indigo" title="Uplink" subtitle={STATUS_LABEL[status]}>
          <div className="sat-visual">
            <Satellite3D status={status} />
            <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
          </div>
        </ChartCard>
        <Card className="span-7" title="Terminal" flush>
          <SatelliteTerminal onStatusChange={setStatus} />
        </Card>
      </div>

      <div className="chart-grid">
        <Card className="span-5" title="Tracked satellites" flush>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Satellite</th><th>NORAD</th><th>Alt (km)</th><th>Next pass (UTC)</th></tr></thead>
              <tbody>
                {satellites.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="mono">{s.norad_id}</td>
                    <td>{s.altitude_km}</td>
                    <td>{formatDateTime(s.next_pass_utc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="span-7" title="Ground track (approximate)" flush>
          {satellites[0] && <GeoAccuracyMap lat={satellites[0].lat} lng={satellites[0].lng} city={satellites[0].region} accuracyKm={300} />}
        </Card>
      </div>
    </>
  );
}
