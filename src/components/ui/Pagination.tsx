import { Button } from './Button';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limits?: number[];
}

export function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange, limits = [10, 20, 50] }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="pagination">
      <span className="pagination-info">
        {from}–{to} of {total}
      </span>
      <div className="pagination-controls">
        {onLimitChange && (
          <label className="pagination-limit">
            Rows
            <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
              {limits.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        )}
        <Button variant="secondary" size="sm" icon="chevronLeft" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        <span className="pagination-page">Page {page} of {totalPages}</span>
        <Button variant="secondary" size="sm" icon="chevronRight" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
      </div>
    </div>
  );
}
