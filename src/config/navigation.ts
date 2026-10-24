import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  label: string;
  path: string;
  icon: IconName;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  { title: 'Overview', items: [{ label: 'Dashboard', path: '/', icon: 'dashboard' }] },
  {
    title: 'Investigations',
    items: [
      { label: 'Cases', path: '/cases', icon: 'cases' },
      { label: 'Evidence', path: '/evidence', icon: 'evidence' },
      { label: 'Forensics', path: '/forensics', icon: 'shield' },
      { label: 'Analysis jobs', path: '/jobs', icon: 'jobs' },
      { label: 'Integrations', path: '/integrations', icon: 'refresh' },
      { label: 'IP Intelligence', path: '/ip-intelligence', icon: 'search' },
    ],
  },
  {
    title: 'SOC Operations',
    items: [
      { label: 'Overview', path: '/soc/overview', icon: 'dashboard' },
      { label: 'Real-Time Monitor', path: '/soc/real-time-monitor', icon: 'dashboard' },
      { label: 'SIEM Search', path: '/soc/siem-search', icon: 'search' },
      { label: 'Alerts', path: '/soc/alerts', icon: 'alert' },
      { label: 'Incidents', path: '/soc/incidents', icon: 'alertCircle' },
      { label: 'Endpoint Security', path: '/soc/endpoint-security', icon: 'lock' },
      { label: 'Threat Intelligence', path: '/soc/threat-intelligence', icon: 'shield' },
      { label: 'Network Watch', path: '/soc/network-watch', icon: 'evidence' },
      { label: 'Vulnerability Mgmt', path: '/soc/vulnerability-mgmt', icon: 'alert' },
      { label: 'Case Management', path: '/soc/case-management', icon: 'cases' },
      { label: 'Reports', path: '/soc/reports', icon: 'inbox' },
      { label: 'Playbooks', path: '/soc/playbooks', icon: 'checkCircle' },
      { label: 'Satellite Uplink', path: '/soc/satellite', icon: 'satellite' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', path: '/users', icon: 'users' },
      { label: 'Audit logs', path: '/audit-logs', icon: 'audit' },
      { label: 'Settings', path: '/settings', icon: 'settings' },
    ],
  },
];
