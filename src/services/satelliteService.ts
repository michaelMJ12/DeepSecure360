import type { SatelliteInfo } from '@/types/models';
import { mockSatellites } from '@/mocks/soc';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface TerminalLine {
  kind: 'input' | 'output' | 'error';
  text: string;
}

/**
 * Backs the Satellite Uplink terminal. Every command resolves to real,
 * publicly published orbital data (which satellite, how high, when it's
 * next overhead) — never a location, photo, or activity for a person.
 */
export const satelliteService = {
  async list(): Promise<SatelliteInfo[]> {
    await wait(200);
    return mockSatellites;
  },

  /** Runs one terminal command and returns the lines to print. */
  async run(command: string): Promise<TerminalLine[]> {
    const [cmd, ...rest] = command.trim().split(/\s+/);
    const arg = rest.join(' ');
    await wait(350 + Math.random() * 300);

    switch ((cmd ?? '').toUpperCase()) {
      case 'HELP':
        return [
          { kind: 'output', text: 'Available commands:' },
          { kind: 'output', text: '  SCAN              list satellites with an upcoming pass' },
          { kind: 'output', text: '  CONNECT <name|id> acquire telemetry uplink to a satellite' },
          { kind: 'output', text: '  STATUS            show current link status' },
          { kind: 'output', text: '  DISCONNECT        close the uplink' },
          { kind: 'output', text: '  CLEAR             clear the screen' },
        ];
      case 'SCAN':
        return [
          { kind: 'output', text: `Scanning for satellites with a pass in the next 6 hours...` },
          ...mockSatellites.map((s) => ({
            kind: 'output' as const,
            text: `  [${s.norad_id}] ${s.name.padEnd(16)} alt ${s.altitude_km} km · next pass ${new Date(s.next_pass_utc).toUTCString().slice(17, 22)} UTC · max elev ${s.max_elevation_deg}°`,
          })),
        ];
      case 'CONNECT': {
        if (!arg) return [{ kind: 'error', text: 'Usage: CONNECT <satellite name or NORAD id>' }];
        const sat = mockSatellites.find((s) => s.name.toLowerCase().includes(arg.toLowerCase()) || s.norad_id === arg);
        if (!sat) return [{ kind: 'error', text: `No tracked satellite matches "${arg}". Try SCAN first.` }];
        return [
          { kind: 'output', text: `Acquiring uplink to ${sat.name} (NORAD ${sat.norad_id})...` },
          { kind: 'output', text: `Link established. Altitude ${sat.altitude_km} km, azimuth ${sat.azimuth_deg}°, elevation ${sat.max_elevation_deg}°.` },
          { kind: 'output', text: `Ground track centered near ${sat.city}, ${sat.region}.` },
          { kind: 'output', text: `Purpose: ${sat.purpose} (operator: ${sat.operator}).` },
        ];
      }
      case 'STATUS':
        return [{ kind: 'output', text: 'Telemetry nominal. No individual tracking is available or performed over this link.' }];
      case 'DISCONNECT':
        return [{ kind: 'output', text: 'Uplink closed.' }];
      case 'CLEAR':
        return [];
      default:
        if (/locat|track|person|human|people|face|photo|social/i.test(command)) {
          return [{ kind: 'error', text: 'Not supported: satellite telemetry does not include a person\'s location, photo, or activity.' }];
        }
        return [{ kind: 'error', text: `Unknown command "${cmd}". Type HELP for a list of commands.` }];
    }
  },
};
