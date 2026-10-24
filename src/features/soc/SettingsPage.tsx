import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { DynamicForm } from '@/components/form/DynamicForm';
import type { FieldSchema } from '@/components/form/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROLES, toOptions } from '@/utils/options';

const orgSchema: FieldSchema[] = [
  { name: 'org_name', label: 'Organization name', type: 'text', required: true, defaultValue: 'DeepSecure360' },
  { name: 'timezone', label: 'Default timezone', type: 'text', required: true, defaultValue: 'Africa/Lagos', colSpan: 1 },
  { name: 'retention_days', label: 'Audit log retention (days)', type: 'number', required: true, min: 30, max: 3650, defaultValue: 365, colSpan: 1 },
  { name: 'require_mfa', label: 'Require MFA for all users', type: 'checkbox', defaultValue: true },
];

const notifySchema: FieldSchema[] = [
  { name: 'notify_critical', label: 'Notify on critical alerts', type: 'checkbox', defaultValue: true },
  { name: 'notify_incident', label: 'Notify when an incident is opened', type: 'checkbox', defaultValue: true },
  { name: 'digest_role', label: 'Daily digest sent to', type: 'select', options: toOptions(ROLES), defaultValue: 'org_admin' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  return (
    <>
      <PageHeader title="Settings" description="Organization, appearance and notification preferences." />
      <Alert variant="info" title={`Signed in as ${user ? `${user.first_name} ${user.last_name}` : 'unknown'}`} className="form-alert">
        Settings here are a demo form and are not persisted to a backend yet.
      </Alert>
      <div className="chart-grid">
        <Card className="span-5" title="Appearance">
          <div className="settings-row">
            <div>
              <strong>Theme</strong>
              <p className="muted-note" style={{ marginTop: 2 }}>Switch between dark and light mode across the whole app.</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>
        <Card className="span-7" title="Organization">
          <DynamicForm schema={orgSchema} submitLabel="Save organization settings" onSubmit={() => { toast.success('Saved', 'Organization settings updated.'); return Promise.resolve(); }} />
        </Card>
      </div>
      <Card title="Notifications">
        <DynamicForm schema={notifySchema} submitLabel="Save notification settings" onSubmit={() => { toast.success('Saved', 'Notification preferences updated.'); return Promise.resolve(); }} />
      </Card>
    </>
  );
}
