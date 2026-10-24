import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const CasesPage = lazy(() => import('@/features/cases/CasesPage'));
const EvidencePage = lazy(() => import('@/features/evidence/EvidencePage'));
const JobsPage = lazy(() => import('@/features/jobs/JobsPage'));
const ForensicsPage = lazy(() => import('@/features/forensics/ForensicsPage'));
const IntegrationsPage = lazy(() => import('@/features/integrations/IntegrationsPage'));
const IpIntelligencePage = lazy(() => import('@/features/geolocation/IpIntelligencePage'));
const SocOverviewPage = lazy(() => import('@/features/soc/SocOverviewPage'));
const RealTimeMonitorPage = lazy(() => import('@/features/soc/RealTimeMonitorPage'));
const SiemSearchPage = lazy(() => import('@/features/soc/SiemSearchPage'));
const AlertsPage = lazy(() => import('@/features/soc/AlertsPage'));
const IncidentsPage = lazy(() => import('@/features/soc/IncidentsPage'));
const EndpointSecurityPage = lazy(() => import('@/features/soc/EndpointSecurityPage'));
const ThreatIntelligencePage = lazy(() => import('@/features/soc/ThreatIntelligencePage'));
const NetworkWatchPage = lazy(() => import('@/features/soc/NetworkWatchPage'));
const VulnerabilityMgmtPage = lazy(() => import('@/features/soc/VulnerabilityMgmtPage'));
const ReportsPage = lazy(() => import('@/features/soc/ReportsPage'));
const PlaybooksPage = lazy(() => import('@/features/soc/PlaybooksPage'));
const SatelliteUplinkPage = lazy(() => import('@/features/soc/SatelliteUplinkPage'));
const SettingsPage = lazy(() => import('@/features/soc/SettingsPage'));
const UsersPage = lazy(() => import('@/features/users/UsersPage'));
const AuditLogsPage = lazy(() => import('@/features/audit/AuditLogsPage'));

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="forensics" element={<ForensicsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="ip-intelligence" element={<IpIntelligencePage />} />
          <Route path="soc/overview" element={<SocOverviewPage />} />
          <Route path="soc/real-time-monitor" element={<RealTimeMonitorPage />} />
          <Route path="soc/siem-search" element={<SiemSearchPage />} />
          <Route path="soc/alerts" element={<AlertsPage />} />
          <Route path="soc/incidents" element={<IncidentsPage />} />
          <Route path="soc/endpoint-security" element={<EndpointSecurityPage />} />
          <Route path="soc/threat-intelligence" element={<ThreatIntelligencePage />} />
          <Route path="soc/network-watch" element={<NetworkWatchPage />} />
          <Route path="soc/vulnerability-mgmt" element={<VulnerabilityMgmtPage />} />
          <Route path="soc/case-management" element={<CasesPage />} />
          <Route path="soc/reports" element={<ReportsPage />} />
          <Route path="soc/playbooks" element={<PlaybooksPage />} />
          <Route path="soc/satellite" element={<SatelliteUplinkPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="*" element={<EmptyState icon="alertCircle" title="Page not found" description="Use the sidebar to get back on track." />} />
        </Route>
      </Route>
    </Routes>
  );
}
