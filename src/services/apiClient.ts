import type { ApiEnvelope, ApiMeta } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type Query = Record<string, string | number | undefined>;

async function request<T>(method: string, path: string, body?: unknown, query?: Query) {
  const url = new URL(BASE_URL + path, window.location.origin);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  });

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include', // JWT lives in HTTP-only cookies (Blueprint 3.3)
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError('NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.', 0);
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !envelope || !envelope.success) {
    throw new ApiRequestError(
      envelope?.error?.code ?? 'UNKNOWN_ERROR',
      envelope?.error?.message ?? res.statusText ?? 'Something went wrong.',
      res.status,
      envelope?.error?.details,
    );
  }
  return { data: envelope.data as T, meta: envelope.meta as ApiMeta | undefined };
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

/** Turn any thrown value into a message that is safe to show in the UI. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}
