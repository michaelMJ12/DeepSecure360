import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Field } from './Field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, required, className, id, rows = 4, ...rest },
  ref,
) {
  const auto = useId();
  const areaId = id ?? auto;
  return (
    <Field id={areaId} label={label} required={required} error={error} hint={hint}>
      <div className={cn('control', error && 'control-error')}>
        <textarea
          ref={ref}
          id={areaId}
          rows={rows}
          className={cn('input', 'textarea', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${areaId}-error` : undefined}
          {...rest}
        />
      </div>
    </Field>
  );
});
