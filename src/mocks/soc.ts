import type {
  AttackEvent, EndpointAsset, NetworkConnection, Playbook, SecurityAlert, SecurityIncident,
  SatelliteInfo, SocReport, Vulnerability,
} from '@/types/models';
import { SAMPLE_GEO } from './geo';

const day = 86_400_000;
const hr = 3_600_000;
const ago = (d: number) => new Date(Date.now() - d * day).toISOString();
const agoHr = (h: number) => new Date(Date.now() - h * hr).toISOString();
const inHr = (h: number) => new Date(Date.now() + h * hr).toISOString();

const alertNames = [
  'Brute Force Login Attempt', 'Malware Detected', 'Phishing URL Detected', 'Unusual Data Transfer',
  'Exploit Attempt Blocked', 'Suspicious PowerShell Activity', 'Port Scan Detected', 'Credential Stuffing',
];
const severities = ['critical', 'high', 'medium', 'low', 'info'] as const;
const alertStatuses = ['new', 'investigating', 'resolved', 'dismissed'] as const;
const ipFor = (i: number) => `${10 + (i % 180)}.${(i * 11) % 255}.${(i * 3) % 255}.${(i * 7) % 255}`;

export const mockAlerts: SecurityAlert[] = Array.from({ length: 24 }, (_, i) => ({
  id: `alt-${i + 1}`,
  time: agoHr(i * 0.6),
  alert_name: alertNames[i % alertNames.length],
  severity: severities[i % severities.length],
  source_ip: ipFor(i),
  destination_ip: ipFor(i + 50),
  status: alertStatuses[i % alertStatuses.length],
}));

const incidentTitles = ['Suspicious PowerShell Activity', 'Multiple Failed Logins', 'Malware Detected on Host', 'Data Exfiltration Attempt', 'Account Takeover Suspected'];
const incidentStatuses = ['new', 'investigating', 'contained', 'resolved'] as const;

export const mockIncidents: SecurityIncident[] = Array.from({ length: 12 }, (_, i) => ({
  id: `inc-${i + 1}`,
  incident_number: `INC-${1020 + i}`,
  title: incidentTitles[i % incidentTitles.length],
  severity: severities[i % severities.length],
  assigned_to: ['Amara Okafor', 'Daniel Eze', 'Fatima Bello', 'Ibrahim Musa'][i % 4],
  status: incidentStatuses[i % incidentStatuses.length],
  opened_at: agoHr(i * 2.3),
}));

const osList = ['Windows 11 Pro', 'Windows Server 2022', 'Ubuntu 22.04 LTS', 'macOS Sonoma'];
const agentStatuses = ['connected', 'degraded', 'offline'] as const;

export const mockEndpoints: EndpointAsset[] = Array.from({ length: 16 }, (_, i) => ({
  id: `ep-${i + 1}`,
  hostname: `WKS-${String(100 + i)}`,
  os: osList[i % osList.length],
  ip: `172.16.${i % 10}.${20 + i}`,
  agent_status: agentStatuses[i % agentStatuses.length],
  risk_score: 10 + ((i * 17) % 90),
  last_seen: agoHr(i * 0.4),
}));

const protocols = ['TCP/443', 'TCP/22', 'TCP/3389', 'UDP/53', 'TCP/445'];
const connStatuses = ['allowed', 'blocked', 'flagged'] as const;
const geoList = Object.values(SAMPLE_GEO);

export const mockConnections: NetworkConnection[] = Array.from({ length: 20 }, (_, i) => {
  const src = geoList[i % geoList.length];
  const dst = geoList[(i + 3) % geoList.length];
  return {
    id: `conn-${i + 1}`,
    src_ip: src.ip,
    src_city: src.city,
    src_country: src.country,
    dst_ip: dst.ip,
    dst_city: dst.city,
    dst_country: dst.country,
    protocol: protocols[i % protocols.length],
    bytes: 4096 + i * 87234,
    status: connStatuses[i % connStatuses.length],
    created_at: agoHr(i * 0.3),
  };
});

const cves = ['CVE-2024-3094', 'CVE-2024-21412', 'CVE-2023-38831', 'CVE-2024-6387', 'CVE-2024-23897'];
const vulnTitles = ['XZ Utils Backdoor', 'SmartScreen Bypass', 'WinRAR Path Traversal', 'OpenSSH RCE', 'Jenkins CLI Arbitrary File Read'];
const vulnStatuses = ['open', 'patching', 'mitigated', 'closed'] as const;

export const mockVulnerabilities: Vulnerability[] = Array.from({ length: 14 }, (_, i) => ({
  id: `vuln-${i + 1}`,
  cve_id: cves[i % cves.length],
  title: vulnTitles[i % vulnTitles.length],
  severity: severities[i % severities.length],
  asset: `WKS-${String(100 + (i % 16))}`,
  status: vulnStatuses[i % vulnStatuses.length],
  discovered_at: ago(20 - i),
}));

const reportTypes = ['Weekly SOC Summary', 'Incident Postmortem', 'Vulnerability Report', 'Compliance Report', 'Executive Briefing'];
const reportStatuses = ['draft', 'ready', 'sent'] as const;

export const mockReports: SocReport[] = Array.from({ length: 9 }, (_, i) => ({
  id: `rep-${i + 1}`,
  title: `${reportTypes[i % reportTypes.length]} — ${new Date(Date.now() - i * 7 * day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
  report_type: reportTypes[i % reportTypes.length],
  period: 'Last 7 days',
  generated_by: ['Amara Okafor', 'Daniel Eze', 'Fatima Bello'][i % 3],
  status: reportStatuses[i % reportStatuses.length],
  created_at: ago(i * 3),
}));

const playbookNames = ['Contain Ransomware Host', 'Phishing Email Triage', 'Credential Reset Flow', 'Malware Sandbox Submission', 'Firewall Block IOC', 'Escalate to Tier 2'];
const playbookStatuses = ['active', 'draft', 'retired'] as const;

export const mockPlaybooks: Playbook[] = Array.from({ length: 8 }, (_, i) => ({
  id: `pb-${i + 1}`,
  name: playbookNames[i % playbookNames.length],
  trigger: ['Alert: Malware detected', 'Alert: Phishing URL', 'Incident opened', 'Manual'][i % 4],
  category: ['Containment', 'Triage', 'Response', 'Automation'][i % 4],
  status: playbookStatuses[i % playbookStatuses.length],
  last_run: i % 3 === 0 ? null : agoHr(i * 4),
  created_at: ago(40 - i * 2),
}));

/* ---------- Attack map: aggregate traffic arcs, city/country level ---------- */
const attackTypes = ['Brute Force', 'Malware C2', 'Phishing', 'Exploitation', 'Port Scan'];
const assetSites: Array<[string, string, string, number, number]> = [
  ['Lagos', 'Lagos', 'NG', 6.5244, 3.3792],
  ['Abuja', 'FCT', 'NG', 9.0579, 7.4951],
  ['Amsterdam', 'North Holland', 'NL', 52.3676, 4.9041],
];

export const mockAttackEvents: AttackEvent[] = Array.from({ length: 10 }, (_, i) => {
  const src = geoList[i % geoList.length];
  const [dCity, dRegion, dCountry, dLat, dLng] = assetSites[i % assetSites.length];
  const [slat, slng] = src.loc.split(',').map(Number);
  return {
    id: `atk-${i + 1}`,
    src_city: src.city, src_region: src.region, src_country: src.country, src_lat: slat, src_lng: slng,
    dst_city: dCity, dst_region: dRegion, dst_country: dCountry, dst_lat: dLat, dst_lng: dLng,
    attack_type: attackTypes[i % attackTypes.length],
    severity: severities[i % severities.length],
    ts: agoHr(i * 0.2),
  };
});

/* ---------- Satellite Uplink: real public satellites, orbital pass data only ---------- */
export const mockSatellites: SatelliteInfo[] = [
  { id: 'sat-1', name: 'ISS (ZARYA)', norad_id: '25544', operator: 'NASA/Roscosmos/ESA/JAXA/CSA', purpose: 'Crewed space station', altitude_km: 408, next_pass_utc: inHr(1.4), max_elevation_deg: 62, azimuth_deg: 214, region: 'West Africa', city: 'Lagos', lat: 6.52, lng: 3.38 },
  { id: 'sat-2', name: 'NOAA-18', norad_id: '28654', operator: 'NOAA', purpose: 'Weather imaging', altitude_km: 854, next_pass_utc: inHr(3.1), max_elevation_deg: 41, azimuth_deg: 178, region: 'West Africa', city: 'Abuja', lat: 9.06, lng: 7.5 },
  { id: 'sat-3', name: 'METEOSAT-11', norad_id: '40732', operator: 'EUMETSAT', purpose: 'Geostationary weather imaging', altitude_km: 35786, next_pass_utc: inHr(0.2), max_elevation_deg: 55, azimuth_deg: 10, region: 'West Africa', city: 'Lagos', lat: 6.52, lng: 3.38 },
  { id: 'sat-4', name: 'LANDSAT 9', norad_id: '49260', operator: 'USGS/NASA', purpose: 'Land imaging', altitude_km: 705, next_pass_utc: inHr(5.6), max_elevation_deg: 33, azimuth_deg: 96, region: 'East Africa', city: 'Nairobi', lat: -1.29, lng: 36.82 },
  { id: 'sat-5', name: 'SENTINEL-2A', norad_id: '40697', operator: 'ESA Copernicus', purpose: 'Land/coastal imaging', altitude_km: 786, next_pass_utc: inHr(2.0), max_elevation_deg: 48, azimuth_deg: 142, region: 'Southern Africa', city: 'Johannesburg', lat: -26.2, lng: 28.05 },
];

/* ---------- SOC Overview (matches the reference dashboard layout) ---------- */
export interface OverviewStat {
  key: string;
  label: string;
  value: string;
  trendPct: number;
  trendUp: boolean;
  icon: 'alert' | 'shield' | 'alertCircle' | 'evidence' | 'checkCircle';
  accent: 'red' | 'orange' | 'purple' | 'blue' | 'green';
  series: number[];
}

export const mockOverviewStats: OverviewStat[] = [
  { key: 'total_alerts', label: 'Total Alerts', value: '128', trendPct: 23, trendUp: true, icon: 'alert', accent: 'red', series: [40, 52, 46, 60, 55, 70, 64, 80, 72, 90, 84, 100] },
  { key: 'critical_alerts', label: 'Critical Alerts', value: '18', trendPct: 12, trendUp: true, icon: 'shield', accent: 'orange', series: [6, 9, 7, 11, 8, 13, 10, 15, 12, 17, 14, 18] },
  { key: 'open_incidents', label: 'Open Incidents', value: '7', trendPct: 13, trendUp: false, icon: 'alertCircle', accent: 'purple', series: [12, 11, 13, 10, 11, 9, 10, 8, 9, 7, 8, 7] },
  { key: 'assets_monitored', label: 'Assets Monitored', value: '1,248', trendPct: 8, trendUp: true, icon: 'evidence', accent: 'blue', series: [1100, 1120, 1140, 1150, 1160, 1180, 1190, 1205, 1215, 1225, 1238, 1248] },
  { key: 'threats_blocked', label: 'Threats Blocked', value: '342', trendPct: 31, trendUp: true, icon: 'checkCircle', accent: 'green', series: [180, 200, 210, 230, 240, 260, 270, 290, 300, 315, 328, 342] },
];

export const mockTopCountries = [
  { country: 'United States', count: 256 },
  { country: 'Russia', count: 142 },
  { country: 'China', count: 98 },
  { country: 'Netherlands', count: 64 },
  { country: 'Germany', count: 42 },
];

export const mockAttackTypes = [
  { label: 'Brute Force', pct: 35, color: '#f43f5e' },
  { label: 'Malware', pct: 28, color: '#fb923c' },
  { label: 'Phishing', pct: 20, color: '#a78bfa' },
  { label: 'Exploitation', pct: 12, color: '#38bdf8' },
  { label: 'Other', pct: 5, color: '#94a3b8' },
];
export const ATTACK_TYPES_TOTAL = 602;

export const mockAlertDistribution = [
  { label: 'Critical', pct: 14, count: 18, color: '#f43f5e' },
  { label: 'High', pct: 25, count: 32, color: '#fb923c' },
  { label: 'Medium', pct: 35, count: 45, color: '#fbbf24' },
  { label: 'Low', pct: 20, count: 25, color: '#38bdf8' },
  { label: 'Informational', pct: 6, count: 8, color: '#94a3b8' },
];
export const ALERT_DISTRIBUTION_TOTAL = 128;

export const mockSystemStatus = ['SIEM', 'EDR', 'Network Sensors', 'Threat Intel Feeds', 'SOAR'].map((name) => ({ name, status: 'Operational' as const }));

export interface RecentCaseSummary { title: string; case_number: string; severity: 'critical' | 'high' | 'medium'; ago: string }
export const mockOverviewRecentCases: RecentCaseSummary[] = [
  { title: 'Suspicious PowerShell Activity', case_number: '#CASE-1024', severity: 'high', ago: '2h ago' },
  { title: 'Multiple Failed Logins', case_number: '#CASE-1023', severity: 'medium', ago: '4h ago' },
  { title: 'Malware Detected on Host', case_number: '#CASE-1022', severity: 'high', ago: '6h ago' },
];

export interface OverviewAlertRow { time: string; alert_name: string; severity: 'critical' | 'high' | 'medium'; source: string; destination: string; status: 'New' | 'Investigating' }
export const mockOverviewAlerts: OverviewAlertRow[] = [
  { time: '10:32:45', alert_name: 'Brute Force Login Attempt', severity: 'critical', source: '203.0.113.45', destination: '192.168.1.10', status: 'New' },
  { time: '10:31:12', alert_name: 'Malware Detected', severity: 'high', source: '192.168.1.25', destination: '192.168.1.80', status: 'New' },
  { time: '10:30:05', alert_name: 'Phishing URL Detected', severity: 'medium', source: '203.0.113.78', destination: '192.168.1.15', status: 'Investigating' },
  { time: '10:29:47', alert_name: 'Unusual Data Transfer', severity: 'high', source: '192.168.1.30', destination: '203.0.113.200', status: 'Investigating' },
  { time: '10:28:33', alert_name: 'Exploit Attempt Blocked', severity: 'critical', source: '198.51.100.23', destination: '192.168.1.5', status: 'New' },
];

export const mockThreatFeedTicker = [
  'New IOC: Malicious IP 185.220.101.45 observed in attacks',
  'Malware Campaign: "Luminous Manticore" targeting financial sector',
  'Critical Vulnerability CVE-2024-3094 detected in your network',
];
