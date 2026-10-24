import { cn } from '@/utils/cn';
import type { SatelliteLinkStatus } from '@/types/models';

interface Satellite3DProps {
  status: SatelliteLinkStatus;
  size?: number;
}

/**
 * Pure CSS 3D satellite: a body with two solar panels, slowly rotating on
 * the X and Y axes. Spins faster and glows while acquiring/connected.
 */
export function Satellite3D({ status, size = 220 }: Satellite3DProps) {
  return (
    <div className={cn('sat3d-stage', `sat3d-${status}`)} style={{ width: size, height: size }}>
      <div className="sat3d-orbit-ring" />
      <div className="sat3d-rotor">
        <div className="sat3d-body">
          <div className="sat3d-face sat3d-face-front" />
          <div className="sat3d-face sat3d-face-back" />
          <div className="sat3d-face sat3d-face-top" />
          <div className="sat3d-face sat3d-face-bottom" />
          <div className="sat3d-face sat3d-face-left" />
          <div className="sat3d-face sat3d-face-right" />
          <div className="sat3d-dish" />
        </div>
        <div className="sat3d-panel sat3d-panel-left" />
        <div className="sat3d-panel sat3d-panel-right" />
      </div>
      <span className="sat3d-pulse" />
    </div>
  );
}
