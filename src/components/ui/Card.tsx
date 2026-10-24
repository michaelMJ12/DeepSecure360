import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}

export function Card({ title, actions, children, className, flush }: CardProps) {
  return (
    <section className={cn('card', className)}>
      {(title || actions) && (
        <header className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={cn('card-body', flush && 'card-body-flush')}>{children}</div>
    </section>
  );
}
