import type { ListParams, ListResult } from '@/types/api';
import { api } from './apiClient';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/** Contract every table page talks to. Swap mock/REST without touching UI code. */
export interface ResourceService<T extends { id: string }> {
  list(params: ListParams): Promise<ListResult<T>>;
  create(payload: Partial<T>): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createRestService<T extends { id: string }>(path: string): ResourceService<T> {
  return {
    async list(p) {
      const { data, meta } = await api.get<T[]>(path, {
        page: p.page,
        limit: p.limit,
        search: p.search,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        ...p.filters,
      });
      return {
        items: data,
        meta: meta ?? { page: p.page, limit: p.limit, total: data.length, totalPages: 1 },
      };
    },
    create: async (payload) => (await api.post<T>(path, payload)).data,
    update: async (id, payload) => (await api.patch<T>(`${path}/${id}`, payload)).data,
    remove: async (id) => {
      await api.delete(`${path}/${id}`);
    },
  };
}

export function createMockService<T extends { id: string }>(
  seed: T[],
  searchKeys: Array<keyof T>,
  delay = 350,
): ResourceService<T> {
  let rows = [...seed];
  return {
    async list(p) {
      await wait(delay);
      let out = rows;
      const q = p.search?.trim().toLowerCase();
      if (q) out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
      Object.entries(p.filters ?? {}).forEach(([k, v]) => {
        if (v) out = out.filter((r) => String((r as Record<string, unknown>)[k]) === v);
      });
      if (p.sortBy) {
        const key = p.sortBy;
        const dir = p.sortOrder === 'desc' ? -1 : 1;
        out = [...out].sort((a, b) => {
          const av = (a as Record<string, unknown>)[key];
          const bv = (b as Record<string, unknown>)[key];
          if (av === bv) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          return av > bv ? dir : -dir;
        });
      }
      const total = out.length;
      const start = (p.page - 1) * p.limit;
      return {
        items: out.slice(start, start + p.limit),
        meta: { page: p.page, limit: p.limit, total, totalPages: Math.max(1, Math.ceil(total / p.limit)) },
      };
    },
    async create(payload) {
      await wait(delay);
      const row = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() } as unknown as T;
      rows = [row, ...rows];
      return row;
    },
    async update(id, payload) {
      await wait(delay);
      const idx = rows.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error('This record no longer exists. Refresh the list.');
      rows[idx] = { ...rows[idx], ...payload };
      return rows[idx];
    },
    async remove(id) {
      await wait(delay);
      rows = rows.filter((r) => r.id !== id);
    },
  };
}

export function createService<T extends { id: string }>(path: string, seed: T[], searchKeys: Array<keyof T>) {
  return USE_MOCK ? createMockService(seed, searchKeys) : createRestService<T>(path);
}
