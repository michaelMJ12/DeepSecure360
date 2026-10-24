import { Navigate, useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Icon } from '@/components/ui/Icon';
import { DynamicForm } from '@/components/form/DynamicForm';
import type { FieldSchema } from '@/components/form/types';
import { useAuth } from '@/context/AuthContext';
import { USE_MOCK } from '@/services/resourceService';

const schema: FieldSchema[] = [
  { name: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'you@company.com' },
  { name: 'password', label: 'Password', type: 'password', required: true, minLength: 6 },
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();

  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/'} replace />;

  return (
    <div className="login">
      <div className="login-panel">
        <span className="brand-mark brand-mark-lg"><Icon name="shield" size={26} /></span>
        <h1>Sign in to DeepSecure360</h1>
        <p className="login-sub">Admin console for cases, evidence and analysis.</p>
        {USE_MOCK && (
          <Alert variant="info" title="Demo mode">Backend not connected. Use any email and a password of 6+ characters.</Alert>
        )}
        <DynamicForm schema={schema} submitLabel="Sign in" onSubmit={(v) => login(String(v.email), String(v.password))} />
      </div>
    </div>
  );
}
