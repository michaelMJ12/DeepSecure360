import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert, type AlertVariant } from '@/components/ui/Alert';

interface Toast {
  id: number;
  variant: AlertVariant;
  title: string;
  message?: string;
}

interface ToastApi {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (variant: AlertVariant, title: string, message?: string) => {
      const id = nextId++;
      setToasts((t) => [...t, { id, variant, title, message }]);
      setTimeout(() => dismiss(id), variant === 'error' ? 8000 : 4500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, m) => push('success', t, m),
      error: (t, m) => push('error', t, m),
      info: (t, m) => push('info', t, m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <Alert key={t.id} variant={t.variant} title={t.title} onClose={() => dismiss(t.id)}>
            {t.message}
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
