interface DonutSlice { label: string; pct: number; color: string }

interface DonutChartProps {
  slices: DonutSlice[];
  total: number | string;
  totalLabel?: string;
  size?: number;
  thickness?: number;
}

/** CSS conic-gradient donut with a centered total — no chart library needed. */
export function DonutChart({ slices, total, totalLabel = 'Total', size = 130, thickness = 16 }: DonutChartProps) {
  let acc = 0;
  const stops = slices
    .map((s) => {
      const from = acc;
      acc += s.pct;
      return `${s.color} ${from}% ${acc}%`;
    })
    .join(', ');

  return (
    <div className="donut" style={{ width: size, height: size, background: `conic-gradient(${stops})` }}>
      <div className="donut-hole" style={{ inset: thickness }}>
        <strong>{total}</strong>
        <span>{totalLabel}</span>
      </div>
    </div>
  );
}
