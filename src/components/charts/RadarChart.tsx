import { useState } from 'react';
import type { RadarPoint } from '@/types/models';
import { useElementSize } from '@/hooks/useElementSize';
import { humanize } from '@/utils/format';
import { Legend } from './Legend';
import { niceScale } from './chartUtils';

type Key = 'activeCases' | 'criticalCases' | 'evidenceItems';

const SERIES: Array<{ key: Key; label: string; color: string }> = [
  { key: 'activeCases', label: 'Active cases', color: '#22d3ee' },
  { key: 'criticalCases', label: 'Critical cases', color: '#fb7185' },
  { key: 'evidenceItems', label: 'Evidence items', color: '#a3e635' },
];

const RINGS = 5;

/** Spider-net chart: one axis per case category, one coloured shape per metric. */
export function RadarChart({ data, height = 330 }: { data: RadarPoint[]; height?: number }) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  const toggle = (k: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const n = data.length;
  const shown = SERIES.filter((s) => !hidden.has(s.key));
  const rawMax = Math.max(0, ...data.flatMap((d) => shown.map((s) => d[s.key])));
  const { top } = niceScale(rawMax, RINGS);

  const cx = width / 2;
  const cy = height / 2 + 2;
  const radius = Math.max(40, Math.min(width / 2 - 78, height / 2 - 34));
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const at = (i: number, r: number) => ({ x: cx + Math.cos(angle(i)) * r, y: cy + Math.sin(angle(i)) * r });
  const ring = (j: number) => data.map((_, i) => at(i, (radius * j) / RINGS)).map((p) => `${p.x},${p.y}`).join(' ');
  const shape = (key: Key) => data.map((d, i) => at(i, (d[key] / top) * radius)).map((p) => `${p.x},${p.y}`).join(' ');

  const hd = hover !== null ? data[hover] : null;

  return (
    <div>
      <Legend items={SERIES} hidden={hidden} onToggle={toggle} />
      <div ref={ref} className="chart-canvas" style={{ height }}>
        {width > 0 && n > 2 && (
          <svg width={width} height={height} onMouseLeave={() => setHover(null)} role="img" aria-label="Radar chart of cases and evidence by category">
            {Array.from({ length: RINGS }, (_, j) => (
              <polygon key={j} points={ring(j + 1)} className="radar-ring" fillOpacity={(j % 2 === 0 ? 0.05 : 0.02)} />
            ))}
            {data.map((_, i) => {
              const p = at(i, radius);
              return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="radar-axis" />;
            })}
            {Array.from({ length: RINGS }, (_, j) => (
              <text key={j} x={cx + 5} y={cy - (radius * (j + 1)) / RINGS + 12} className="ax-text radar-tick">
                {Math.round((top * (j + 1)) / RINGS * 10) / 10}
              </text>
            ))}

            {shown.map((s) => (
              <g key={s.key} className="radar-series">
                <polygon points={shape(s.key)} fill={s.color} fillOpacity="0.18" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${s.color}88)` }} />
                {data.map((d, i) => {
                  const p = at(i, (d[s.key] / top) * radius);
                  return <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 5 : 3.2} fill="#08161c" stroke={s.color} strokeWidth="2" />;
                })}
              </g>
            ))}

            {data.map((d, i) => {
              const p = at(i, radius + 14);
              const c = Math.cos(angle(i));
              return (
                <text key={d.category} x={p.x} y={p.y + 4} textAnchor={c > 0.25 ? 'start' : c < -0.25 ? 'end' : 'middle'} className={hover === i ? 'ax-text radar-label is-hot' : 'ax-text radar-label'}>
                  {humanize(d.category)}
                </text>
              );
            })}

            {data.map((_, i) => {
              const p = at(i, radius + 10);
              return <line key={`hit-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="transparent" strokeWidth="30" onMouseEnter={() => setHover(i)} onMouseMove={() => setHover(i)} />;
            })}
          </svg>
        )}
        {hd && (
          <div className="chart-tooltip" style={{ right: 8, top: 6 }}>
            <strong>{humanize(hd.category)}</strong>
            {SERIES.map((s) => (
              <span key={s.key}><i style={{ background: s.color }} />{s.label} <b>{hd[s.key]}</b></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
