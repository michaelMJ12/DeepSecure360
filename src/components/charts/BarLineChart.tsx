import { useId, useState } from 'react';
import type { TimeBucket } from '@/types/models';
import { useElementSize } from '@/hooks/useElementSize';
import { Legend } from './Legend';
import { niceScale, smoothPath, svgId } from './chartUtils';

type Key = 'activeCases' | 'evidenceItems' | 'criticalCases';

const BARS: Array<{ key: Key; label: string; from: string; to: string }> = [
  { key: 'activeCases', label: 'Active cases', from: '#22d3ee', to: '#6366f1' },
  { key: 'evidenceItems', label: 'Evidence items', from: '#c084fc', to: '#ec4899' },
];
const LINE = { key: 'criticalCases' as Key, label: 'Critical cases', color: '#fbbf24' };

const LEGEND = [
  { key: 'activeCases', label: 'Active cases', color: '#22d3ee' },
  { key: 'evidenceItems', label: 'Evidence items', color: '#c084fc' },
  { key: 'criticalCases', label: 'Critical cases', color: '#fbbf24' },
];

const M = { t: 14, r: 14, b: 30, l: 34 };

export function BarLineChart({ buckets, height = 300 }: { buckets: TimeBucket[]; height?: number }) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const uid = svgId(useId());

  const toggle = (k: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const n = buckets.length;
  const visibleKeys = (['activeCases', 'evidenceItems', 'criticalCases'] as Key[]).filter((k) => !hidden.has(k));
  const rawMax = Math.max(0, ...buckets.flatMap((b) => visibleKeys.map((k) => b[k])));
  const { top, step, n: ticks } = niceScale(rawMax);

  const plotW = Math.max(0, width - M.l - M.r);
  const plotH = height - M.t - M.b;
  const band = n ? plotW / n : 0;
  const bars = BARS.filter((b) => !hidden.has(b.key));
  const groupW = band * 0.74;
  const barW = bars.length ? Math.max(2, groupW / bars.length - 2) : 0;
  const y = (v: number) => M.t + plotH - (v / top) * plotH;
  const cx = (i: number) => M.l + band * i + band / 2;

  const linePts = buckets.map((b, i) => ({ x: cx(i), y: y(b[LINE.key]) }));
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 58))));
  const hb = hover !== null ? buckets[hover] : null;

  return (
    <div>
      <Legend items={LEGEND} hidden={hidden} onToggle={toggle} />
      <div ref={ref} className="chart-canvas" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} onMouseLeave={() => setHover(null)} role="img" aria-label="Bar and line chart of active cases, evidence items and critical cases over time">
            <defs>
              {BARS.map((b) => (
                <linearGradient key={b.key} id={`${uid}-${b.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={b.from} />
                  <stop offset="100%" stopColor={b.to} stopOpacity="0.55" />
                </linearGradient>
              ))}
              <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={LINE.color} stopOpacity="0" />
              </linearGradient>
              <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {Array.from({ length: ticks + 1 }, (_, i) => {
              const v = i * step;
              return (
                <g key={i}>
                  <line x1={M.l} x2={width - M.r} y1={y(v)} y2={y(v)} className="ax-grid" />
                  <text x={M.l - 8} y={y(v) + 4} textAnchor="end" className="ax-text">{v}</text>
                </g>
              );
            })}

            {hover !== null && <rect x={M.l + band * hover} y={M.t} width={band} height={plotH} className="ax-hover" />}

            {buckets.map((b, i) => {
              const gx = M.l + band * i + (band - groupW) / 2;
              return bars.map((bar, j) => {
                const h = (b[bar.key] / top) * plotH;
                return (
                  <rect
                    key={`${i}-${bar.key}`}
                    x={gx + j * (barW + 2)}
                    y={M.t + plotH - h}
                    width={barW}
                    height={h}
                    rx={Math.min(4, barW / 2)}
                    fill={`url(#${uid}-${bar.key})`}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                );
              });
            })}

            {!hidden.has(LINE.key) && n > 1 && (
              <g>
                <path d={`${smoothPath(linePts)} L${linePts[n - 1].x},${M.t + plotH} L${linePts[0].x},${M.t + plotH} Z`} fill={`url(#${uid}-area)`} />
                <path d={smoothPath(linePts)} fill="none" stroke={LINE.color} strokeWidth="6" opacity="0.5" filter={`url(#${uid}-glow)`} />
                <path d={smoothPath(linePts)} fill="none" stroke={LINE.color} strokeWidth="2.5" strokeLinecap="round" />
                {linePts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 5.5 : 3.5} fill="#0b1226" stroke={LINE.color} strokeWidth="2" />
                ))}
              </g>
            )}

            {buckets.map((b, i) =>
              (n - 1 - i) % labelEvery === 0 ? (
                <text key={`l-${i}`} x={cx(i)} y={height - 9} textAnchor="middle" className="ax-text">{b.label}</text>
              ) : null,
            )}

            {buckets.map((b, i) => (
              <rect key={`h-${i}`} x={M.l + band * i} y={M.t} width={band} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseMove={() => setHover(i)}>
                <title>{b.label}</title>
              </rect>
            ))}
          </svg>
        )}
        {hb && (
          <div className="chart-tooltip" style={{ left: Math.min(Math.max(cx(hover!) - 80, 4), Math.max(4, width - 172)), top: 6 }}>
            <strong>{hb.label}</strong>
            <span><i style={{ background: BARS[0].from }} />Active cases <b>{hb.activeCases}</b></span>
            <span><i style={{ background: BARS[1].from }} />Evidence items <b>{hb.evidenceItems}</b></span>
            <span><i style={{ background: LINE.color }} />Critical cases <b>{hb.criticalCases}</b></span>
          </div>
        )}
      </div>
    </div>
  );
}
