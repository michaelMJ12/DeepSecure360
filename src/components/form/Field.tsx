import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Shared label / hint / error wrapper for every form control. */
export function Field({ id, label, required, error, hint, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="field-required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`}>{error}</p>
      ) : hint ? (
        <p className="field-hint" id={`${id}-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}
