import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import type { FieldSchema } from '@/components/form/types';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { userService } from '@/services';
import type { User } from '@/types/models';
import { formatDateTime, humanize } from '@/utils/format';
import { ROLES, toOptions } from '@/utils/options';

const columns: Column<User>[] = [
  { key: 'last_name', header: 'Name', sortable: true, render: (u) => <strong>{u.first_name} {u.last_name}</strong> },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', sortable: true, render: (u) => humanize(u.role) },
  { key: 'mfa_enabled', header: 'MFA', render: (u) => <Badge tone={u.mfa_enabled ? 'success' : 'warning'}>{u.mfa_enabled ? 'On' : 'Off'}</Badge> },
  { key: 'is_active', header: 'Status', render: (u) => <StatusBadge value={u.is_active ? 'active' : 'inactive'} /> },
  { key: 'last_login_at', header: 'Last sign-in', sortable: true, render: (u) => formatDateTime(u.last_login_at) },
];

const schema = (mode: 'create' | 'edit'): FieldSchema[] => [
  { name: 'first_name', label: 'First name', type: 'text', required: true, colSpan: 1, maxLength: 100 },
  { name: 'last_name', label: 'Last name', type: 'text', required: true, colSpan: 1, maxLength: 100 },
  { name: 'email', label: 'Work email', type: 'email', required: true },
  { name: 'role', label: 'Role', type: 'select', required: true, options: toOptions(ROLES), hint: 'Controls which cases, evidence and forensic tools this user can reach.' },
  {
    name: 'password', label: 'Temporary password', type: 'password', required: true, minLength: 12,
    hint: 'At least 12 characters. The user changes it at first sign-in.',
    visibleWhen: () => mode === 'create',
  },
  { name: 'mfa_enabled', label: 'Require multi-factor authentication', type: 'checkbox', defaultValue: true, hint: 'Required for admin and forensic roles.' },
  { name: 'is_active', label: 'Account is active', type: 'checkbox', defaultValue: true },
];

export default function UsersPage() {
  return (
    <ResourcePage<User>
      title="Users"
      description="Manage who can sign in and what they can do."
      entityName="user"
      service={userService}
      columns={columns}
      filters={[
        { key: 'role', label: 'Role', options: toOptions(ROLES) },
        { key: 'is_active', label: 'Status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
      ]}
      formSchema={schema}
      allowDelete
      searchPlaceholder="Search by name, email or role"
      defaultSort={{ key: 'last_name', order: 'asc' }}
      rowLabel={(u) => `${u.first_name} ${u.last_name}`}
      toPayload={(v) => ({ ...v, organization_id: 'org-1' }) as unknown as Partial<User>}
    />
  );
}
