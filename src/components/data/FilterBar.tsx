import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { Option } from '@/components/form/types';

export interface FilterConfig {
  key: string;
  label: string;
  options: Option[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function FilterBar({ filters, values, onChange, onReset }: FilterBarProps) {
  const active = Object.values(values).some(Boolean);
  return (
    <div className="filterbar">
      <Icon name="filter" size={16} className="filterbar-icon" />
      {filters.map((f) => (
        <select
          key={f.key}
          className="input filter-select"
          aria-label={f.label}
          value={values[f.key] ?? ''}
          onChange={(e) => onChange(f.key, e.target.value)}
        >
          <option value="">{f.label}: all</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {active && <Button variant="ghost" size="sm" icon="x" onClick={onReset}>Clear filters</Button>}
    </div>
  );
}
