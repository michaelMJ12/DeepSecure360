import type { ReactNode } from 'react';
import type { ApiMeta, SortOrder } from '@/types/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  mono?: boolean;
  align?: 'left' | 'right';
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  meta: ApiMeta;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSortChange?: (key: string, order: SortOrder) => void;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  rowActions?: (row: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/** Generic table: sorting, selection, row actions, loading skeletons, empty and error states, pagination. */
export function DataTable<T extends { id: string }>({
  columns, rows, meta, loading, error, onRetry, sortBy, sortOrder, onSortChange, onPageChange, onLimitChange,
  selectable, selectedIds = [], onSelectionChange, rowActions, emptyTitle = 'Nothing here yet', emptyDescription, emptyAction,
}: DataTableProps<T>) {
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  const toggleAll = () => onSelectionChange?.(allSelected ? selectedIds.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...selectedIds, ...rows.map((r) => r.id)])]);
  const toggleOne = (id: string) => onSelectionChange?.(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const handleSort = (c: Column<T>) => {
    if (!c.sortable || !onSortChange) return;
    onSortChange(c.key, sortBy === c.key && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const cell = (row: T, c: Column<T>) => {
    if (c.render) return c.render(row);
    const v = (row as unknown as Record<string, unknown>)[c.key];
    return v === null || v === undefined || v === '' ? '—' : String(v);
  };

  const colCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  if (error) {
    return (
      <div className="table-state">
        <Alert variant="error" title="Could not load data">{error}</Alert>
        {onRetry && <Button variant="secondary" icon="refresh" onClick={onRetry}>Try again</Button>}
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <div className={cn('table-scroll', loading && rows.length > 0 && 'is-loading')}>
        <table className="table">
          <thead>
            <tr>
              {selectable && (
                <th className="col-check">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width, textAlign: c.align }}
                  aria-sort={sortBy === c.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className="th-sort" onClick={() => handleSort(c)}>
                      {c.header}
                      <Icon name={sortBy === c.key ? (sortOrder === 'asc' ? 'chevronUp' : 'chevronDown') : 'sort'} size={14} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {rowActions && <th className="col-actions"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={`sk-${i}`} className="skeleton-row">
                  {Array.from({ length: colCount }, (_, j) => (
                    <td key={j}><span className="skeleton" /></td>
                  ))}
                </tr>
              ))}
            {rows.map((row) => (
              <tr key={row.id} className={cn(selectedIds.includes(row.id) && 'is-selected')}>
                {selectable && (
                  <td className="col-check">
                    <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleOne(row.id)} aria-label="Select row" />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={cn(c.mono && 'mono')} style={{ textAlign: c.align }}>{cell(row, c)}</td>
                ))}
                {rowActions && <td className="col-actions">{rowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        )}
      </div>
      <Pagination {...meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
}
