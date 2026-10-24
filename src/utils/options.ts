import type { Option } from '@/components/form/types';
import { humanize } from './format';

export const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ value: v, label: humanize(v) }));

export const ROLES = ['super_admin', 'org_admin', 'security_analyst', 'forensic_investigator', 'viewer', 'api_client'] as const;
export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;
export const CASE_STATUSES = ['open', 'in_progress', 'pending_review', 'resolved', 'closed'] as const;
export const CASE_CATEGORIES = ['malware', 'phishing', 'insider_threat', 'data_breach', 'other'] as const;
export const EVIDENCE_TYPES = ['file', 'memory_dump', 'disk_image', 'network_capture', 'log_file', 'screenshot'] as const;
export const EVIDENCE_STATUSES = ['pending', 'scanning', 'quarantined', 'clean', 'infected', 'analyzing', 'analyzed'] as const;
export const JOB_STATUSES = ['queued', 'processing', 'completed', 'failed', 'cancelled'] as const;
export const JOB_TYPES = ['threat_analysis', 'forensic_summary', 'log_anomaly', 'ioc_scan'] as const;

export const SCAN_ENGINES = ['yara', 'sigma', 'custom'] as const;
export const SCAN_TARGETS = ['file', 'memory', 'disk', 'network', 'log'] as const;
export const SCAN_STATUSES = ['queued', 'running', 'completed', 'failed'] as const;
export const SCAN_VERDICTS = ['clean', 'suspicious', 'malicious', 'inconclusive'] as const;
export const SIEM_VENDORS = ['splunk', 'elastic', 'sentinel'] as const;
export const EDR_VENDORS = ['crowdstrike', 'carbonblack'] as const;
export const THREAT_FEEDS = ['misp', 'otx', 'virustotal'] as const;
export const EDR_ALERT_STATUSES = ['new', 'investigating', 'contained', 'resolved'] as const;
