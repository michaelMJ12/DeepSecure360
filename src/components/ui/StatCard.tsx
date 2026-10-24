import { Icon, type IconName } from './Icon';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: IconName;
  tone?: 'default' | 'danger' | 'warning';
  note?: string;
}

export function StatCard({ label, value, icon, tone = 'default', note }: StatCardProps) {
  return (
    <div className={cn('stat', tone !== 'default' && `stat-${tone}`)}>
      <span className="stat-icon"><Icon name={icon} size={20} /></span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {note && <p className="stat-note">{note}</p>}
      </div>
    </div>
  );
}
