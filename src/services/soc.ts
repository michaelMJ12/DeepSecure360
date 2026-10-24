import type {
  AttackEvent, EndpointAsset, NetworkConnection, Playbook, SecurityAlert, SecurityIncident,
  SocReport, Vulnerability,
} from '@/types/models';
import {
  mockAlerts, mockAttackEvents, mockConnections, mockEndpoints, mockIncidents, mockPlaybooks,
  mockReports, mockVulnerabilities,
} from '@/mocks/soc';
import { createService } from './resourceService';

export const alertService = createService<SecurityAlert>('/soc/alerts', mockAlerts, ['alert_name', 'source_ip', 'destination_ip', 'severity']);
export const incidentService = createService<SecurityIncident>('/soc/incidents', mockIncidents, ['incident_number', 'title', 'assigned_to']);
export const endpointService = createService<EndpointAsset>('/soc/endpoints', mockEndpoints, ['hostname', 'os', 'ip']);
export const connectionService = createService<NetworkConnection>('/soc/connections', mockConnections, ['src_ip', 'dst_ip', 'src_city', 'dst_city']);
export const vulnerabilityService = createService<Vulnerability>('/soc/vulnerabilities', mockVulnerabilities, ['cve_id', 'title', 'asset']);
export const reportService = createService<SocReport>('/soc/reports', mockReports, ['title', 'report_type', 'generated_by']);
export const playbookService = createService<Playbook>('/soc/playbooks', mockPlaybooks, ['name', 'trigger', 'category']);

/** Static list for the attack map — same aggregate city/country shape as the globe and geo map. */
export async function getAttackEvents(): Promise<AttackEvent[]> {
  await new Promise((r) => setTimeout(r, 250));
  return mockAttackEvents;
}
