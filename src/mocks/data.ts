import type { AnalysisJob, AuditLog, Case, EdrAlert, EvidenceItem, ForensicScan, ThreatIndicator, User, WebhookEvent } from '@/types/models';

const day = 86_400_000;
const ago = (d: number) => new Date(Date.now() - d * day).toISOString();
const ahead = (d: number) => new Date(Date.now() + d * day).toISOString();
const hash = (n: number) => (n.toString(16).padStart(2, '0') + 'a3f9c2d17b').repeat(7).slice(0, 64);

const names: Array<[string, string]> = [
  ['Amara', 'Okafor'], ['Daniel', 'Eze'], ['Fatima', 'Bello'], ['Ibrahim', 'Musa'], ['Chioma', 'Nwosu'],
  ['Tunde', 'Adeyemi'], ['Zainab', 'Yusuf'], ['Emeka', 'Obi'], ['Halima', 'Sani'], ['Segun', 'Balogun'],
];
const roles = ['org_admin', 'security_analyst', 'forensic_investigator', 'viewer', 'security_analyst'] as const;

export const mockUsers: User[] = names.map(([f, l], i) => ({
  id: `usr-${i + 1}`,
  organization_id: 'org-1',
  email: `${f}.${l}@example.com`.toLowerCase(),
  first_name: f,
  last_name: l,
  role: roles[i % roles.length],
  mfa_enabled: i % 3 !== 0,
  is_active: i !== 7,
  last_login_at: i === 9 ? null : ago(i),
  created_at: ago(60 + i * 3),
}));

const caseTitles = [
  ['Ransomware on finance file server', 'malware', 'critical'],
  ['Credential phishing campaign', 'phishing', 'high'],
  ['Unusual after-hours data export', 'insider_threat', 'high'],
  ['Customer records exposed in S3 bucket', 'data_breach', 'critical'],
  ['Suspicious PowerShell on workstation', 'malware', 'medium'],
  ['Spoofed CEO invoice request', 'phishing', 'medium'],
  ['Shared admin account misuse', 'insider_threat', 'low'],
  ['VPN brute-force attempts', 'other', 'low'],
  ['USB exfiltration attempt', 'insider_threat', 'medium'],
  ['Malicious macro attachment', 'malware', 'high'],
  ['Lost laptop report', 'data_breach', 'info'],
  ['DNS tunnelling alert', 'other', 'medium'],
] as const;
const statuses = ['open', 'in_progress', 'pending_review', 'resolved', 'closed'] as const;

export const mockCases: Case[] = caseTitles.map(([title, category, severity], i) => ({
  id: `case-${i + 1}`,
  case_number: `DS360-2026-${String(i + 1).padStart(4, '0')}`,
  title,
  description: `Investigation record for: ${title}.`,
  severity,
  status: statuses[i % statuses.length],
  category,
  assigned_to: mockUsers[(i % 4) + 1].email,
  sla_deadline: i % 5 === 4 ? null : ahead(i - 3),
  created_at: ago(30 - i * 2),
}));

const evTypes = ['file', 'memory_dump', 'disk_image', 'network_capture', 'log_file', 'screenshot'] as const;
const evStatuses = ['pending', 'scanning', 'quarantined', 'clean', 'infected', 'analyzing', 'analyzed'] as const;

export const mockEvidence: EvidenceItem[] = Array.from({ length: 14 }, (_, i) => ({
  id: `ev-${i + 1}`,
  evidence_number: `EV-2026-${String(i + 1).padStart(5, '0')}`,
  case_number: mockCases[i % mockCases.length].case_number,
  type: evTypes[i % evTypes.length],
  title: `${['Server image', 'Memory capture', 'Phishing email', 'PCAP export', 'Auth log', 'Screenshot'][i % 6]} ${i + 1}`,
  description: 'Collected during incident response.',
  file_size: (i + 1) * 48_000_000 + 1234,
  file_hash_sha256: hash(i + 11),
  status: evStatuses[i % evStatuses.length],
  uploaded_by: mockUsers[(i % 5) + 1].email,
  created_at: ago(20 - i),
}));

const jobTypes = ['threat_analysis', 'forensic_summary', 'log_anomaly', 'ioc_scan'] as const;
const jobStatuses = ['queued', 'processing', 'completed', 'failed', 'completed', 'cancelled'] as const;

export const mockJobs: AnalysisJob[] = Array.from({ length: 12 }, (_, i) => {
  const status = jobStatuses[i % jobStatuses.length];
  const done = status === 'completed';
  return {
    id: `job-${i + 1}`,
    case_number: mockCases[i % mockCases.length].case_number,
    job_type: jobTypes[i % jobTypes.length],
    status,
    model_used: i % 2 ? 'claude-sonnet' : 'gpt-4',
    prompt_version: `v1.${i % 4}`,
    confidence_score: done ? Number((0.6 + (i % 4) * 0.1).toFixed(2)) : null,
    processing_time_ms: done ? 2400 + i * 310 : null,
    created_at: ago(i / 2),
  };
});

const actions = ['LOGIN', 'CASE_CREATE', 'EVIDENCE_ACCESS', 'EVIDENCE_EXPORT', 'USER_UPDATE', 'ROLE_CHANGE'] as const;

export const mockAudit: AuditLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: `aud-${i + 1}`,
  user_email: mockUsers[i % mockUsers.length].email,
  action: actions[i % actions.length],
  resource_type: ['user', 'case', 'evidence', 'evidence', 'user', 'role'][i % 6],
  resource_id: `res-${1000 + i}`,
  ip_address: `10.0.${i % 6}.${20 + i}`,
  created_at: new Date(Date.now() - i * 3_600_000 * 5).toISOString(),
}));

/* ---------- Forensics ---------- */
const engines = ['yara', 'sigma', 'custom'] as const;
const targets = ['file', 'memory', 'disk', 'network', 'log'] as const;
const scanStatuses = ['queued', 'running', 'completed', 'failed'] as const;
const verdicts = ['clean', 'suspicious', 'malicious', 'inconclusive'] as const;
const ruleHits = [
  ['Win32.Trojan.Generic'], ['Suspicious.PowerShell.EncodedCommand'], [], ['Sigma.LateralMovement.SMB'],
  ['YARA.Ransomware.Lockbit'], [], ['Sigma.Persistence.RunKey'], ['Suspicious.MacroExec'],
];

export const mockScans: ForensicScan[] = Array.from({ length: 16 }, (_, i) => {
  const status = scanStatuses[i % scanStatuses.length];
  const done = status === 'completed';
  return {
    id: `scan-${i + 1}`,
    case_number: mockCases[i % mockCases.length].case_number,
    evidence_number: mockEvidence[i % mockEvidence.length].evidence_number,
    engine: engines[i % engines.length],
    target: targets[i % targets.length],
    status,
    verdict: done ? verdicts[i % verdicts.length] : null,
    matched_rules: done ? ruleHits[i % ruleHits.length] : [],
    duration_ms: done ? 1800 + i * 240 : null,
    created_at: ago(12 - i * 0.6),
  };
});

/* ---------- Integrations ---------- */
const feeds = ['misp', 'otx', 'virustotal'] as const;
const indicatorTypes = ['ip', 'domain', 'hash', 'url'] as const;
// Aggregate sensor-network geolocation (city-level, from public threat-intel feeds) — not tied to any individual.
const geo: Array<[string, number, number]> = [
  ['US', 37.09, -95.71], ['DE', 51.17, 10.45], ['CN', 35.86, 104.2], ['RU', 61.52, 105.32],
  ['BR', -14.24, -51.93], ['NG', 9.08, 8.68], ['IN', 20.59, 78.96], ['NL', 52.13, 5.29],
  ['FR', 46.6, 1.89], ['SG', 1.35, 103.82], ['GB', 55.38, -3.44], ['ZA', -30.56, 22.94],
];
const tagSets = [['botnet'], ['phishing-kit'], ['c2'], ['scanner'], ['ransomware'], ['spam']];
const values = (t: (typeof indicatorTypes)[number], i: number) => {
  if (t === 'ip') return `${10 + (i % 200)}.${(i * 7) % 255}.${(i * 13) % 255}.${(i * 3) % 255}`;
  if (t === 'domain') return `evil-${i}.example-c2.net`;
  if (t === 'url') return `https://bad-${i}.example.net/payload`;
  return hash(50 + i);
};

export const mockIndicators: ThreatIndicator[] = Array.from({ length: 18 }, (_, i) => {
  const [country, lat, lng] = geo[i % geo.length];
  const type = indicatorTypes[i % indicatorTypes.length];
  return {
    id: `ioc-${i + 1}`,
    feed: feeds[i % feeds.length],
    type,
    value: values(type, i),
    score: 35 + ((i * 11) % 65),
    country,
    lat: lat + (((i * 17) % 10) - 5),
    lng: lng + (((i * 23) % 10) - 5),
    tags: tagSets[i % tagSets.length],
    first_seen: ago(25 - i),
  };
});

const edrVendors = ['crowdstrike', 'carbonblack'] as const;
const edrSeverities = ['critical', 'high', 'medium', 'low'] as const;
const edrStatuses = ['new', 'investigating', 'contained', 'resolved'] as const;
const techniques = ['T1059 Command/Scripting', 'T1055 Process Injection', 'T1021 Remote Services', 'T1486 Data Encrypted for Impact', 'T1078 Valid Accounts'];

export const mockEdrAlerts: EdrAlert[] = Array.from({ length: 10 }, (_, i) => ({
  id: `edr-${i + 1}`,
  vendor: edrVendors[i % edrVendors.length],
  severity: edrSeverities[i % edrSeverities.length],
  hostname: `WKS-${String(100 + i)}`,
  technique: techniques[i % techniques.length],
  status: edrStatuses[i % edrStatuses.length],
  created_at: ago(5 - i * 0.3),
}));

const whSources = ['splunk', 'elastic', 'sentinel', 'crowdstrike', 'carbonblack', 'ticketing'] as const;
const whEvents = ['alert.critical', 'alert.new', 'case.updated', 'scan.completed', 'edr.detection'];

export const mockWebhookEvents: WebhookEvent[] = Array.from({ length: 14 }, (_, i) => ({
  id: `wh-${i + 1}`,
  source: whSources[i % whSources.length],
  event: whEvents[i % whEvents.length],
  organization_id: 'org-1',
  signature_valid: i % 7 !== 6,
  received_at: ago(2 - i * 0.12),
}));
