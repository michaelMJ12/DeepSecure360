import type { AnalysisJob, AuditLog, Case, EdrAlert, EvidenceItem, ForensicScan, User, WebhookEvent } from '@/types/models';
import { mockAudit, mockCases, mockEdrAlerts, mockEvidence, mockJobs, mockScans, mockUsers, mockWebhookEvents } from '@/mocks/data';
import { createService } from './resourceService';

export const userService = createService<User>('/users', mockUsers, ['email', 'first_name', 'last_name', 'role']);
export const caseService = createService<Case>('/cases', mockCases, ['case_number', 'title', 'assigned_to', 'category']);
export const evidenceService = createService<EvidenceItem>('/evidence', mockEvidence, ['evidence_number', 'title', 'case_number', 'file_hash_sha256']);
export const jobService = createService<AnalysisJob>('/jobs', mockJobs, ['case_number', 'job_type', 'model_used']);
export const auditService = createService<AuditLog>('/audit-logs', mockAudit, ['user_email', 'action', 'resource_type', 'ip_address']);

export const forensicScanService = createService<ForensicScan>('/forensics/scans', mockScans, ['case_number', 'evidence_number', 'engine', 'target']);
export const edrAlertService = createService<EdrAlert>('/integrations/edr/alerts', mockEdrAlerts, ['hostname', 'technique', 'vendor']);
export const webhookEventService = createService<WebhookEvent>('/webhooks/events', mockWebhookEvents, ['source', 'event', 'organization_id']);
