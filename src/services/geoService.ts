import type { IpGeoLookup } from '@/types/models';
import { isLikelyIp, pseudoGeoFor, SAMPLE_GEO } from '@/mocks/geo';
import { createService } from './resourceService';
import { USE_MOCK } from './resourceService';
import { ApiRequestError } from './apiClient';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Raw city-level fields returned by a provider lookup, before it's saved to history. */
export type GeoRaw = Omit<IpGeoLookup, 'id' | 'looked_up_by' | 'looked_up_at' | 'note'>;

const IPINFO_TOKEN = import.meta.env.VITE_IPINFO_TOKEN as string | undefined;

/**
 * City/region-level IP geolocation only (ipinfo.io-shaped response).
 * There is deliberately no path here to a precise coordinate, a photo,
 * or a social-media handle — a provider lookup cannot supply those.
 */
export const geoService = {
  async lookup(ipRaw: string): Promise<GeoRaw> {
    const ip = ipRaw.trim();
    if (!isLikelyIp(ip)) throw new ApiRequestError('INVALID_IP', 'Enter a valid IPv4 address, e.g. 197.211.63.207.', 400);

    if (!USE_MOCK) {
      if (!IPINFO_TOKEN) {
        throw new ApiRequestError('MISSING_TOKEN', 'Set VITE_IPINFO_TOKEN in .env to query the live provider.', 400);
      }
      const res = await fetch(`https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`);
      if (!res.ok) throw new ApiRequestError('PROVIDER_ERROR', 'The geolocation provider could not be reached.', res.status);
      const body = await res.json();
      if (body.bogon) throw new ApiRequestError('BOGON_IP', 'This is a private/reserved address and has no public geolocation.', 400);
      return {
        ip: body.ip,
        city: body.city ?? 'Unknown',
        region: body.region ?? 'Unknown',
        country: body.country ?? '—',
        loc: body.loc ?? '0,0',
        org: body.org ?? 'Unknown',
        timezone: body.timezone ?? '—',
        accuracy_radius_km: 50, // providers don't return this; 50 km is the documented typical city-level figure
      };
    }

    await wait(450);
    return SAMPLE_GEO[ip] ?? pseudoGeoFor(ip);
  },
};

/** History of lookups analysts have run. Reuses the standard mock/REST resource pattern. */
export const ipLookupHistoryService = createService<IpGeoLookup>(
  '/integrations/geo/lookups',
  [],
  ['ip', 'city', 'region', 'country', 'org', 'looked_up_by'],
);
