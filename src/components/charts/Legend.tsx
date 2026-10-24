export interface LegendItem {
  key: string;
  label: string;
  color: string;
}

interface LegendProps {
  items: LegendItem[];
  hidden?: Set<string>;
  onToggle?: (key: string) => void;
}

/** Clickable legend: click an entry to hide or show that series. */
export function Legend({ items, hidden, onToggle }: LegendProps) {
  return (
    <ul className="chart-legend">
      {items.map((it) => {
        const off = hidden?.has(it.key);
        return (
          <li key={it.key}>
            <button type="button" className={off ? 'is-off' : undefined} onClick={() => onToggle?.(it.key)} aria-pressed={!off}>
              <span className="legend-dot" style={{ background: it.color, boxShadow: `0 0 8px ${it.color}` }} />
              {it.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
