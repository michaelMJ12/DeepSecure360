import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Field } from './Field';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, required, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <Field id={inputId} label={label} required={required} error={error} hint={hint}>
      <div className={cn('control', error && 'control-error')}>
        {icon && <Icon name={icon} size={16} className="control-icon" />}
        <input
          ref={ref}
          id={inputId}
          className={cn('input', icon && 'input-with-icon', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          required={required}
          {...rest}
        />
      </div>
    </Field>
  );
});
