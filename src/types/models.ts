/** Entity types follow the core tables in Blueprint section 6 (snake_case kept to match the API). */
export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'security_analyst'
  | 'forensic_investigator'
  | 'viewer'
  | 'api_client';

export interface User {
  id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  mfa_enabled: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CaseStatus = 'open' | 'in_progress' | 'pending_review' | 'resolved' | 'closed';

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  severity: Severity;
  status: CaseStatus;
  category: string;
  assigned_to: string;
  sla_deadline: string | null;
  created_at: string;
}

export type EvidenceType = 'file' | 'memory_dump' | 'disk_image' | 'network_capture' | 'log_file' | 'screenshot';
export type EvidenceStatus = 'pending' | 'scanning' | 'quarantined' | 'clean' | 'infected' | 'analyzing' | 'analyzed';

export interface EvidenceItem {
  id: string;
  evidence_number: string;
  case_number: string;
  type: EvidenceType;
  title: string;
  description: string;
  file_size: number;
  file_hash_sha256: string;
  status: EvidenceStatus;
  uploaded_by: string;
  created_at: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'threat_analysis' | 'forensic_summary' | 'log_anomaly' | 'ioc_scan';

export interface AnalysisJob {
  id: string;
  case_number: string;
  job_type: JobType;
  status: JobStatus;
  model_used: string;
  prompt_version: string;
  confidence_score: number | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  created_at: string;
}

export interface DashboardMetrics {
  openCases: number;
  criticalCases: number;
  evidenceItems: number;
  quarantined: number;
  jobsRunning: number;
  casesBySeverity: Record<Severity, number>;
  casesByStatus: Record<CaseStatus, number>;
  recentAudit: AuditLog[];
}

/* ---------- Analytics (dashboard graphs) ---------- */
export type TimeUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

/** One point on the time axis: a snapshot of every tracked number at that moment. */
export interface TimeBucket {
  ts: number;
  label: string;
  activeCases: number;
  criticalCases: number;
  evidenceItems: number;
  jobsQueued: number;
  jobsProcessing: number;
  jobsFailed: number;
}

/** Radar axis: how the numbers are spread across a case category. */
export interface RadarPoint {
  category: string;
  activeCases: number;
  criticalCases: number;
  evidenceItems: number;
}

export interface EvidenceByCase {
  case_number: string;
  title: string;
  severity: Severity;
  count: number;
}

/** Response of GET /dashboard/analytics?unit=... */
export interface AnalyticsSnapshot {
  unit: TimeUnit;
  buckets: TimeBucket[];
  radar: RadarPoint[];
  evidenceByCase: EvidenceByCase[];
}

/* ---------- Forensics (forensics/ module in the blueprint) ---------- */
export type ScanEngine = 'yara' | 'sigma' | 'custom';
export type ScanTarget = 'file' | 'memory' | 'disk' | 'network' | 'log';
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';
export type ScanVerdict = 'clean' | 'suspicious' | 'malicious' | 'inconclusive';

export interface ForensicScan {
  id: string;
  case_number: string;
  evidence_number: string;
  engine: ScanEngine;
  target: ScanTarget;
  status: ScanStatus;
  verdict: ScanVerdict | null;
  matched_rules: string[];
  duration_ms: number | null;
  created_at: string;
}

/* ---------- Integrations (integrations/ + webhooks/ modules) ---------- */
export type SiemVendor = 'splunk' | 'elastic' | 'sentinel';
export type EdrVendor = 'crowdstrike' | 'carbonblack';
export type ThreatFeedSource = 'misp' | 'otx' | 'virustotal';
export type IndicatorType = 'ip' | 'domain' | 'hash' | 'url';

export interface ThreatIndicator {
  id: string;
  feed: ThreatFeedSource;
  type: IndicatorType;
  value: string;
  score: number; // 0-100 reputation / confidence
  country: string; // ISO 3166-1 alpha-2, aggregate geolocation of the reporting sensor network
  lat: number;
  lng: number;
  tags: string[];
  first_seen: string;
}

export interface EdrAlert {
  id: string;
  vendor: EdrVendor;
  severity: Severity;
  hostname: string;
  technique: string; // MITRE ATT&CK technique id, e.g. T1059
  status: 'new' | 'investigating' | 'contained' | 'resolved';
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  source: SiemVendor | EdrVendor | 'ticketing';
  event: string;
  organization_id: string;
  signature_valid: boolean;
  received_at: string;
}

/* ---------- IP Intelligence (city-level geolocation lookups) ----------
 * Mirrors ipinfo.io-style responses. This is deliberately city/region
 * accuracy only — there is no field for a precise device location,
 * a photo, or social accounts, because an IP lookup cannot provide them. */
export interface IpGeoLookup {
  id: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // "lat,lng"
  org: string; // ASN + ISP/org name
  timezone: string;
  accuracy_radius_km: number; // typical city-level uncertainty for the provider
  looked_up_by: string;
  looked_up_at: string;
  note: string;
}

/* ---------- SOC Operations module ---------- */
export type AlertStatus = 'new' | 'investigating' | 'resolved' | 'dismissed';
export interface SecurityAlert {
  id: string;
  time: string;
  alert_name: string;
  severity: Severity;
  source_ip: string;
  destination_ip: string;
  status: AlertStatus;
}

export type IncidentStatus = 'new' | 'investigating' | 'contained' | 'resolved';
export interface SecurityIncident {
  id: string;
  incident_number: string;
  title: string;
  severity: Severity;
  assigned_to: string;
  status: IncidentStatus;
  opened_at: string;
}

export type AgentStatus = 'connected' | 'degraded' | 'offline';
export interface EndpointAsset {
  id: string;
  hostname: string;
  os: string;
  ip: string;
  agent_status: AgentStatus;
  risk_score: number;
  last_seen: string;
}

export type ConnectionStatus = 'allowed' | 'blocked' | 'flagged';
export interface NetworkConnection {
  id: string;
  src_ip: string;
  src_city: string;
  src_country: string;
  dst_ip: string;
  dst_city: string;
  dst_country: string;
  protocol: string;
  bytes: number;
  status: ConnectionStatus;
  created_at: string;
}

export type VulnSeverity = Severity;
export type VulnStatus = 'open' | 'patching' | 'mitigated' | 'closed';
export interface Vulnerability {
  id: string;
  cve_id: string;
  title: string;
  severity: VulnSeverity;
  asset: string;
  status: VulnStatus;
  discovered_at: string;
}

export type ReportStatus = 'draft' | 'ready' | 'sent';
export interface SocReport {
  id: string;
  title: string;
  report_type: string;
  period: string;
  generated_by: string;
  status: ReportStatus;
  created_at: string;
}

export type PlaybookStatus = 'active' | 'draft' | 'retired';
export interface Playbook {
  id: string;
  name: string;
  trigger: string;
  category: string;
  status: PlaybookStatus;
  last_run: string | null;
  created_at: string;
}

/** One traffic arc on the attack map: aggregate city/country endpoints only. */
export interface AttackEvent {
  id: string;
  src_city: string;
  src_region: string;
  src_country: string;
  src_lat: number;
  src_lng: number;
  dst_city: string;
  dst_region: string;
  dst_country: string;
  dst_lat: number;
  dst_lng: number;
  attack_type: string;
  severity: Severity;
  ts: string;
}

/* ---------- Satellite Uplink (orbital tracking — not a people-tracking tool) ---------- */
export type SatelliteLinkStatus = 'idle' | 'acquiring' | 'connected' | 'lost';
export interface SatelliteInfo {
  id: string;
  name: string;
  norad_id: string;
  operator: string;
  purpose: string;
  altitude_km: number;
  next_pass_utc: string;
  max_elevation_deg: number;
  azimuth_deg: number;
  region: string;
  city: string;
  lat: number;
  lng: number;
}
