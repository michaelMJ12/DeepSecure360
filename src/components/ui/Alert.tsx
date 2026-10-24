import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon, type IconName } from './Icon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<AlertVariant, IconName> = {
  success: 'checkCircle',
  error: 'alertCircle',
  warning: 'alert',
  info: 'info',
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

/** Note card used for inline errors, success confirmations and toasts. */
export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  return (
    <div className={cn('alert', `alert-${variant}`, className)} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon name={ICONS[variant]} size={20} className="alert-icon" />
      <div className="alert-body">
        {title && <strong className="alert-title">{title}</strong>}
        {children && <div className="alert-text">{children}</div>}
      </div>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
