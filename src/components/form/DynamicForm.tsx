import { useMemo, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/services/apiClient';
import { EMAIL_PATTERN } from '@/utils/validators';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import type { FieldSchema, FormValue, FormValues } from './types';

interface DynamicFormProps {
  schema: FieldSchema[];
  initialValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

function buildInitial(schema: FieldSchema[], initial?: Partial<FormValues>): FormValues {
  const out: FormValues = {};
  schema.forEach((f) => {
    const given = initial?.[f.name];
    out[f.name] = given ?? f.defaultValue ?? (f.type === 'checkbox' ? false : '');
  });
  return out;
}

export function validateField(field: FieldSchema, value: FormValue, values: FormValues): string | undefined {
  if (field.visibleWhen && !field.visibleWhen(values)) return undefined;

  if (field.type === 'checkbox') {
    if (field.required && value !== true) return `${field.label} must be checked.`;
    return field.validate?.(value, values);
  }

  const text = String(value ?? '').trim();
  if (!text) return field.required ? `${field.label} is required.` : undefined;

  if (field.type === 'email' && !EMAIL_PATTERN.test(text)) return 'Enter a valid email address.';
  if (field.minLength && text.length < field.minLength) return `Use at least ${field.minLength} characters.`;
  if (field.maxLength && text.length > field.maxLength) return `Use ${field.maxLength} characters or fewer.`;
  if (field.pattern && !field.pattern.test(text)) return field.patternMessage ?? 'Value is not in the expected format.';
  if (field.type === 'number') {
    const n = Number(text);
    if (Number.isNaN(n)) return 'Enter a number.';
    if (field.min !== undefined && n < field.min) return `Must be ${field.min} or more.`;
    if (field.max !== undefined && n > field.max) return `Must be ${field.max} or less.`;
  }
  return field.validate?.(value, values);
}

/**
 * Schema-driven form. Describe fields as data; this component renders,
 * validates (on blur and on submit), shows server errors and handles loading.
 */
export function DynamicForm({ schema, initialValues, onSubmit, onCancel, submitLabel = 'Save' }: DynamicFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitial(schema, initialValues));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const visible = useMemo(() => schema.filter((f) => !f.visibleWhen || f.visibleWhen(values)), [schema, values]);

  const setValue = (name: string, value: FormValue) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name]) {
      const field = schema.find((f) => f.name === name);
      if (field) setErrors((e) => ({ ...e, [name]: validateField(field, value, next) }));
    }
  };

  const handleBlur = (field: FieldSchema) =>
    setErrors((e) => ({ ...e, [field.name]: validateField(field, values[field.name], values) }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const nextErrors: Record<string, string | undefined> = {};
    schema.forEach((f) => (nextErrors[f.name] = validateField(f, values[f.name], values)));
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setFormError('Fix the highlighted fields and try again.');
      return;
    }

    const payload: FormValues = {};
    visible.forEach((f) => {
      const v = values[f.name];
      payload[f.name] = f.type === 'number' && String(v).trim() !== '' ? Number(v) : typeof v === 'string' ? v.trim() : v;
    });

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f: FieldSchema) => {
    const common = {
      name: f.name,
      label: f.label,
      error: errors[f.name],
      hint: f.hint,
      required: f.required,
      disabled: f.disabled || submitting,
      onBlur: () => handleBlur(f),
    };
    const value = values[f.name];
    switch (f.type) {
      case 'textarea':
        return <Textarea {...common} placeholder={f.placeholder} value={String(value)} onChange={(e) => setValue(f.name, e.target.value)} />;
      case 'select':
        return <Select {...common} options={f.options ?? []} placeholder={f.placeholder ?? 'Select…'} value={String(value)} onChange={(e) => setValue(f.name, e.target.value)} />;
      case 'checkbox':
        return <Checkbox label={f.label} hint={f.hint} name={f.name} disabled={f.disabled || submitting} checked={value === true} onChange={(e) => setValue(f.name, e.target.checked)} />;
      default:
        return (
          <Input
            {...common}
            type={f.type}
            placeholder={f.placeholder}
            value={String(value)}
            min={f.min}
            max={f.max}
            autoComplete={f.type === 'password' ? 'new-password' : undefined}
            onChange={(e) => setValue(f.name, e.target.value)}
          />
        );
    }
  };

  return (
    <form className="dynamic-form" onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="error" title="Could not save" className="form-alert">{formError}</Alert>}
      <div className="form-grid">
        {visible.map((f) => (
          <div key={f.name} className={f.colSpan === 1 ? 'col-1' : 'col-2'}>
            {renderField(f)}
          </div>
        ))}
      </div>
      <div className="form-actions">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>}
        <Button type="submit" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
