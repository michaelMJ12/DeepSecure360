import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Field } from './Field';
import type { Option } from './types';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, hint, placeholder, required, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const selectId = id ?? auto;
  return (
    <Field id={selectId} label={label} required={required} error={error} hint={hint}>
      <div className={cn('control', error && 'control-error')}>
        <select
          ref={ref}
          id={selectId}
          className={cn('input', 'select', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </Field>
  );
});
