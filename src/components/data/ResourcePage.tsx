import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ListParams, SortOrder } from '@/types/api';
import type { ResourceService } from '@/services/resourceService';
import { errorMessage } from '@/services/apiClient';
import { useList } from '@/hooks/useList';
import { useToast } from '@/context/ToastContext';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/form/DynamicForm';
import type { FieldSchema, FormValues } from '@/components/form/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type Column } from './DataTable';
import { FilterBar, type FilterConfig } from './FilterBar';
import { SearchBar } from './SearchBar';

type Mode = 'create' | 'edit';

export interface ResourcePageProps<T extends { id: string }> {
  title: string;
  description?: string;
  /** Singular noun used in buttons and messages, e.g. "case". */
  entityName: string;
  service: ResourceService<T>;
  columns: Column<T>[];
  filters?: FilterConfig[];
  /** Provide a schema to enable create and edit. */
  formSchema?: FieldSchema[] | ((mode: Mode) => FieldSchema[]);
  allowCreate?: boolean;
  allowDelete?: boolean;
  searchPlaceholder?: string;
  defaultSort?: { key: string; order: SortOrder };
  rowLabel?: (row: T) => string;
  toFormValues?: (row: T) => Partial<FormValues>;
  toPayload?: (values: FormValues, existing?: T) => Partial<T>;
}

/**
 * A complete admin list page: header, search, filters, smart table,
 * create/edit modal (DynamicForm), delete confirmation, toasts.
 * New resources are mostly configuration.
 */
export function ResourcePage<T extends { id: string }>({
  title, description, entityName, service, columns, filters = [], formSchema, allowCreate = true, allowDelete = false,
  searchPlaceholder, defaultSort, rowLabel, toFormValues, toPayload,
}: ResourcePageProps<T>) {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<ListParams>({
    page: 1,
    limit: 10,
    search: searchParams.get('search') ?? '',
    sortBy: defaultSort?.key,
    sortOrder: defaultSort?.order,
    filters: {},
  });
  const { items, meta, loading, error, reload } = useList(service, params);

  const [formMode, setFormMode] = useState<Mode | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T[] | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const patch = useCallback((p: Partial<ListParams>) => setParams((prev) => ({ ...prev, page: 1, ...p })), []);
  const onSearch = useCallback((search: string) => patch({ search }), [patch]);

  const canEdit = !!formSchema;
  const schema = useMemo(
    () => (!formSchema || !formMode ? [] : typeof formSchema === 'function' ? formSchema(formMode) : formSchema),
    [formSchema, formMode],
  );
  const label = (row: T) => (rowLabel ? rowLabel(row) : row.id);

  const closeForm = () => {
    setFormMode(null);
    setEditing(null);
  };

  const submitForm = async (values: FormValues) => {
    const payload = toPayload ? toPayload(values, editing ?? undefined) : (values as unknown as Partial<T>);
    if (formMode === 'edit' && editing) {
      await service.update(editing.id, payload);
      toast.success('Changes saved', `The ${entityName} was updated.`);
    } else {
      await service.create(payload);
      toast.success(`${title.replace(/s$/, '')} created`, `The ${entityName} was added.`);
    }
    closeForm();
    reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await Promise.all(deleting.map((r) => service.remove(r.id)));
      toast.success('Deleted', `${deleting.length} ${entityName}${deleting.length > 1 ? 's' : ''} removed.`);
      setDeleting(null);
      setSelected([]);
      reload();
    } catch (e) {
      setDeleteError(errorMessage(e));
    } finally {
      setDeleteBusy(false);
    }
  };

  const hasRowActions = canEdit || allowDelete;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="secondary" icon="refresh" onClick={reload} aria-label="Refresh" />
            {canEdit && allowCreate && <Button icon="plus" onClick={() => setFormMode('create')}>New {entityName}</Button>}
          </>
        }
      />

      <Card flush>
        <div className="toolbar">
          <SearchBar value={params.search ?? ''} onChange={onSearch} placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}`} />
          {filters.length > 0 && (
            <FilterBar
              filters={filters}
              values={params.filters ?? {}}
              onChange={(k, v) => patch({ filters: { ...params.filters, [k]: v } })}
              onReset={() => patch({ filters: {}, search: '' })}
            />
          )}
          {selected.length > 0 && allowDelete && (
            <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(items.filter((r) => selected.includes(r.id)))}>
              Delete {selected.length} selected
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          rows={items}
          meta={meta}
          loading={loading}
          error={error}
          onRetry={reload}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSortChange={(sortBy, sortOrder) => patch({ sortBy, sortOrder })}
          onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          onLimitChange={(limit) => patch({ limit })}
          selectable={allowDelete}
          selectedIds={selected}
          onSelectionChange={setSelected}
          emptyTitle={`No ${title.toLowerCase()} found`}
          emptyDescription={params.search || Object.values(params.filters ?? {}).some(Boolean) ? 'Try a different search or clear the filters.' : undefined}
          emptyAction={canEdit && allowCreate && !params.search ? <Button icon="plus" onClick={() => setFormMode('create')}>New {entityName}</Button> : undefined}
          rowActions={
            hasRowActions
              ? (row) => (
                  <div className="row-actions">
                    {canEdit && (
                      <Button variant="ghost" size="sm" icon="edit" aria-label={`Edit ${label(row)}`} onClick={() => { setEditing(row); setFormMode('edit'); }} />
                    )}
                    {allowDelete && (
                      <Button variant="ghost" size="sm" icon="trash" aria-label={`Delete ${label(row)}`} onClick={() => setDeleting([row])} />
                    )}
                  </div>
                )
              : undefined
          }
        />
      </Card>

      <Modal open={formMode !== null} onClose={closeForm} title={formMode === 'edit' ? `Edit ${entityName}` : `New ${entityName}`}>
        {formMode && (
          <DynamicForm
            key={`${formMode}-${editing?.id ?? 'new'}`}
            schema={schema}
            initialValues={editing ? (toFormValues ? toFormValues(editing) : (editing as unknown as FormValues)) : undefined}
            submitLabel={formMode === 'edit' ? 'Save changes' : `Create ${entityName}`}
            onSubmit={submitForm}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete ${entityName}${deleting && deleting.length > 1 ? 's' : ''}?`}
        width={440}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={deleteBusy}>Keep</Button>
            <Button variant="danger" icon="trash" loading={deleteBusy} onClick={() => void confirmDelete()}>Delete</Button>
          </>
        }
      >
        {deleteError && <Alert variant="error" title="Could not delete">{deleteError}</Alert>}
        <p>
          {deleting && deleting.length === 1 ? <><strong>{label(deleting[0])}</strong> will be removed.</> : `${deleting?.length ?? 0} ${entityName}s will be removed.`}{' '}
          This action is recorded in the audit log.
        </p>
      </Modal>
    </>
  );
}
