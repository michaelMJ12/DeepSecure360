import type { TimeUnit } from '@/types/models';
import { LIVE_INTERVAL_MS } from '@/hooks/useAnalytics';
import { cn } from '@/utils/cn';

export const TIME_UNITS: Array<{ value: TimeUnit; label: string }> = [
  { value: 'year', label: 'Year' },
  { value: 'month', label: 'Month' },
  { value: 'day', label: 'Day' },
  { value: 'hour', label: 'Hour' },
  { value: 'minute', label: 'Minute' },
  { value: 'second', label: 'Second' },
];

interface TimeUnitTabsProps {
  value: TimeUnit;
  onChange: (unit: TimeUnit) => void;
}

/** One selector that drives every graph on the page. */
export function TimeUnitTabs({ value, onChange }: TimeUnitTabsProps) {
  const live = LIVE_INTERVAL_MS[value];
  return (
    <div className="time-controls">
      {live && (
        <span className="live-badge" title={`Refreshes every ${live / 1000} s`}>
          <span className="live-dot" /> Live
        </span>
      )}
      <div className="seg" role="radiogroup" aria-label="Time scale">
        {TIME_UNITS.map((u) => (
          <button
            key={u.value}
            type="button"
            role="radio"
            aria-checked={value === u.value}
            className={cn(value === u.value && 'is-active')}
            onClick={() => onChange(u.value)}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
