import type { IpGeoLookup } from '@/types/models';

/**
 * Small set of realistic city-level lookups for demo mode, in the exact
 * shape a provider like ipinfo.io returns. Every entry here is a real
 * public city centroid — this is what "IP geolocation" actually resolves
 * to: a city/ISP region, never a street address or a live position.
 */
export const SAMPLE_GEO: Record<string, Omit<IpGeoLookup, 'id' | 'looked_up_by' | 'looked_up_at' | 'note'>> = {
  '197.211.63.207': { ip: '197.211.63.207', city: 'Abuja', region: 'FCT', country: 'NG', loc: '9.0579,7.4951', org: 'AS37148 Globacom Limited', timezone: 'Africa/Lagos', accuracy_radius_km: 50 },
  '105.112.0.1': { ip: '105.112.0.1', city: 'Lagos', region: 'Lagos', country: 'NG', loc: '6.4549,3.3946', org: 'AS29465 MTN Nigeria', timezone: 'Africa/Lagos', accuracy_radius_km: 50 },
  '41.203.72.1': { ip: '41.203.72.1', city: 'Nairobi', region: 'Nairobi County', country: 'KE', loc: '-1.2921,36.8219', org: 'AS33771 Safaricom Limited', timezone: 'Africa/Nairobi', accuracy_radius_km: 55 },
  '102.33.0.1': { ip: '102.33.0.1', city: 'Johannesburg', region: 'Gauteng', country: 'ZA', loc: '-26.2041,28.0473', org: 'AS37457 MTN SA', timezone: 'Africa/Johannesburg', accuracy_radius_km: 60 },
  '8.8.8.8': { ip: '8.8.8.8', city: 'Mountain View', region: 'California', country: 'US', loc: '37.4056,-122.0775', org: 'AS15169 Google LLC', timezone: 'America/Los_Angeles', accuracy_radius_km: 20 },
  '1.1.1.1': { ip: '1.1.1.1', city: 'Sydney', region: 'New South Wales', country: 'AU', loc: '-33.8688,151.2093', org: 'AS13335 Cloudflare, Inc.', timezone: 'Australia/Sydney', accuracy_radius_km: 25 },
  '185.228.168.1': { ip: '185.228.168.1', city: 'Amsterdam', region: 'North Holland', country: 'NL', loc: '52.3676,4.9041', org: 'AS9009 M247 Europe SRL', timezone: 'Europe/Amsterdam', accuracy_radius_km: 15 },
  '203.0.113.5': { ip: '203.0.113.5', city: 'Singapore', region: 'Central Singapore', country: 'SG', loc: '1.3521,103.8198', org: 'AS7470 Asia Pacific (example block)', timezone: 'Asia/Singapore', accuracy_radius_km: 20 },
};

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Deterministic pseudo-geolocation for any IP not in the sample set, so the demo works for any input. */
export function pseudoGeoFor(ip: string): Omit<IpGeoLookup, 'id' | 'looked_up_by' | 'looked_up_at' | 'note'> {
  const cities = [
    { city: 'Abuja', region: 'FCT', country: 'NG', loc: '9.0579,7.4951', timezone: 'Africa/Lagos', org: 'AS37148 Globacom Limited' },
    { city: 'Accra', region: 'Greater Accra', country: 'GH', loc: '5.6037,-0.1870', timezone: 'Africa/Accra', org: 'AS37075 Vodafone Ghana' },
    { city: 'Cairo', region: 'Cairo Governorate', country: 'EG', loc: '30.0444,31.2357', timezone: 'Africa/Cairo', org: 'AS8452 TE Data' },
    { city: 'London', region: 'England', country: 'GB', loc: '51.5072,-0.1276', timezone: 'Europe/London', org: 'AS2856 British Telecom' },
    { city: 'Toronto', region: 'Ontario', country: 'CA', loc: '43.6532,-79.3832', timezone: 'America/Toronto', org: 'AS812 Rogers Communications' },
    { city: 'Mumbai', region: 'Maharashtra', country: 'IN', loc: '19.0760,72.8777', timezone: 'Asia/Kolkata', org: 'AS55836 Reliance Jio' },
  ];
  let seed = 0;
  for (const ch of ip) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const pick = cities[seed % cities.length];
  return { ip, ...pick, accuracy_radius_km: 35 + (seed % 40) };
}

export function isLikelyIp(value: string): boolean {
  if (!IPV4.test(value.trim())) return false;
  return value.trim().split('.').every((o) => Number(o) <= 255);
}
