import { ResourcePage } from '@/components/data/ResourcePage';
import type { Column } from '@/components/data/DataTable';
import type { FieldSchema } from '@/components/form/types';
import { StatusBadge } from '@/components/ui/Badge';
import { evidenceService } from '@/services';
import type { EvidenceItem } from '@/types/models';
import { formatBytes, formatDate, humanize, shortHash } from '@/utils/format';
import { EVIDENCE_STATUSES, EVIDENCE_TYPES, toOptions } from '@/utils/options';

const columns: Column<EvidenceItem>[] = [
  { key: 'evidence_number', header: 'Evidence', sortable: true, mono: true, width: '150px' },
  { key: 'title', header: 'Title', sortable: true },
  { key: 'case_number', header: 'Case', mono: true },
  { key: 'type', header: 'Type', render: (e) => humanize(e.type) },
  { key: 'file_size', header: 'Size', sortable: true, align: 'right', render: (e) => formatBytes(e.file_size) },
  { key: 'file_hash_sha256', header: 'SHA-256', mono: true, render: (e) => <span title={e.file_hash_sha256}>{shortHash(e.file_hash_sha256)}</span> },
  { key: 'status', header: 'Status', sortable: true, render: (e) => <StatusBadge value={e.status} /> },
  { key: 'created_at', header: 'Added', sortable: true, render: (e) => formatDate(e.created_at) },
];

// Evidence is uploaded through the resumable upload API, so this page edits metadata only.
// Items are never deleted here: chain of custody must stay intact.
const schema: FieldSchema[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, maxLength: 255 },
  { name: 'type', label: 'Type', type: 'select', required: true, options: toOptions(EVIDENCE_TYPES), colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: toOptions(EVIDENCE_STATUSES), colSpan: 1 },
  { name: 'description', label: 'Description', type: 'textarea', maxLength: 2000 },
];

export default function EvidencePage() {
  return (
    <ResourcePage<EvidenceItem>
      title="Evidence"
      description="Uploaded artifacts with hashes and custody status. Items cannot be deleted."
      entityName="evidence item"
      service={evidenceService}
      columns={columns}
      filters={[
        { key: 'type', label: 'Type', options: toOptions(EVIDENCE_TYPES) },
        { key: 'status', label: 'Status', options: toOptions(EVIDENCE_STATUSES) },
      ]}
      formSchema={schema}
      allowCreate={false}
      searchPlaceholder="Search by evidence number, title, case or hash"
      defaultSort={{ key: 'created_at', order: 'desc' }}
      rowLabel={(e) => e.evidence_number}
    />
  );
}
