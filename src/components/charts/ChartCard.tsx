import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type ChartTheme = 'indigo' | 'teal' | 'pulse' | 'plum';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  theme: ChartTheme;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Dark, tinted panel that every graph sits on. The theme sets the matching background colours. */
export function ChartCard({ title, subtitle, theme, actions, className, children }: ChartCardProps) {
  return (
    <section className={cn('chart-card', `theme-${theme}`, className)}>
      <header className="chart-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions}
      </header>
      <div className="chart-body">{children}</div>
    </section>
  );
}
