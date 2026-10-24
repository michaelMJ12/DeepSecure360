import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, hint, id, ...rest }, ref) {
  const auto = useId();
  const boxId = id ?? auto;
  return (
    <div className="checkbox">
      <input ref={ref} id={boxId} type="checkbox" {...rest} />
      <label htmlFor={boxId}>
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </label>
    </div>
  );
});
