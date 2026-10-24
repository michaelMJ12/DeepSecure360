import type { User } from '@/types/models';
import { mockUsers } from '@/mocks/data';
import { api, ApiRequestError } from './apiClient';
import { USE_MOCK } from './resourceService';

const KEY = 'ds360_session';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (!USE_MOCK) return (await api.post<User>('/auth/login', { email, password })).data;
    await wait(500);
    if (password.length < 6) throw new ApiRequestError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
    const user: User = { ...mockUsers[0], email, role: 'super_admin' };
    sessionStorage.setItem(KEY, JSON.stringify(user));
    return user;
  },
  async me(): Promise<User | null> {
    if (!USE_MOCK) {
      try {
        return (await api.get<User>('/auth/me')).data;
      } catch {
        return null;
      }
    }
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  async logout(): Promise<void> {
    if (!USE_MOCK) await api.post('/auth/logout').catch(() => undefined);
    sessionStorage.removeItem(KEY);
  },
};
