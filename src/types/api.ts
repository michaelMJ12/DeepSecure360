/** Mirrors the response envelope in Blueprint section 5.2 / 5.3 */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  requestId?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  meta?: ApiMeta;
  error: ApiErrorBody | null;
}

export type SortOrder = 'asc' | 'desc';

export interface ListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, string>;
}

export interface ListResult<T> {
  items: T[];
  meta: ApiMeta;
}
