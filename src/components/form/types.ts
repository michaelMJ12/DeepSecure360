export interface Option {
  value: string;
  label: string;
}

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
export type FormValue = string | number | boolean;
export type FormValues = Record<string, FormValue>;

/** Describes one field. DynamicForm renders and validates a list of these. */
export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: Option[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  patternMessage?: string;
  defaultValue?: FormValue;
  disabled?: boolean;
  /** 1 = half width, 2 = full width (default). */
  colSpan?: 1 | 2;
  /** Hide the field (and skip its validation) unless this returns true. */
  visibleWhen?: (values: FormValues) => boolean;
  /** Custom rule. Return an error message, or undefined when valid. */
  validate?: (value: FormValue, values: FormValues) => string | undefined;
}
