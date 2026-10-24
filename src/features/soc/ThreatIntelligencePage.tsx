import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/form/Select';
import { ChartCard } from '@/components/charts/ChartCard';
import { ThreatGlobe } from '@/components/globe/ThreatGlobe';
import { PageHeader } from '@/components/layout/PageHeader';
import { errorMessage } from '@/services/apiClient';
import { integrationsService } from '@/services/integrationsService';
import type { ThreatFeedSource, ThreatIndicator } from '@/types/models';
import { formatDateTime, humanize } from '@/utils/format';
import { THREAT_FEEDS, toOptions } from '@/utils/options';

export default function ThreatIntelligencePage() {
  const [feed, setFeed] = useState<ThreatFeedSource>('misp');
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [selected, setSelected] = useState<ThreatIndicator | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    integrationsService.threatIndicators(feed).then(setIndicators).catch((e) => setError(errorMessage(e)));
  }, [feed]);

  return (
    <>
      <PageHeader title="Threat Intelligence" description="IOC feeds from MISP, OTX and VirusTotal, enriched with aggregate geolocation." />
      <div className="chart-grid">
        <ChartCard
          className="span-7"
          theme="indigo"
          title="Threat indicator origins"
          subtitle="Country-level sensor geolocation per indicator. Drag to rotate."
          actions={<Select label="" options={toOptions(THREAT_FEEDS)} value={feed} onChange={(e) => setFeed(e.target.value as ThreatFeedSource)} />}
        >
          {error ? <Alert variant="error" title="Could not load indicators">{error}</Alert> : <ThreatGlobe indicators={indicators} onSelect={setSelected} />}
        </ChartCard>
        <Card title={selected ? 'Indicator detail' : `${indicators.length} indicators from ${feed.toUpperCase()}`} className="span-5">
          {selected ? (
            <dl className="ioc-detail">
              <div><dt>Value</dt><dd className="mono">{selected.value}</dd></div>
              <div><dt>Type</dt><dd>{humanize(selected.type)}</dd></div>
              <div><dt>Reputation score</dt><dd>{selected.score} / 100</dd></div>
              <div><dt>Country</dt><dd>{selected.country}</dd></div>
              <div><dt>First seen</dt><dd>{formatDateTime(selected.first_seen)}</dd></div>
              <div><dt>Tags</dt><dd>{selected.tags.map((t) => <Badge key={t} tone="warning">{t}</Badge>)}</dd></div>
            </dl>
          ) : (
            <p className="muted-note">Hover a point to see details. Feed-level reputation data only.</p>
          )}
        </Card>
      </div>
    </>
  );
}
