interface MiniSparklineProps {
  series: number[];
  color: string;
  width?: number;
  height?: number;
}

/** Tiny inline trend line used on stat cards — no axes, no labels. */
export function MiniSparkline({ series, color, width = 110, height = 34 }: MiniSparklineProps) {
  if (series.length < 2) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1e-6, max - min);
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * width;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(',').map(Number);

  return (
    <svg width={width} height={height} className="sparkline" role="img" aria-hidden="true">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} />
    </svg>
  );
}
