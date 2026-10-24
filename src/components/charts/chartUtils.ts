export interface Point {
  x: number;
  y: number;
}

/** Round a maximum up to a tidy axis top with whole-number steps. */
export function niceScale(max: number, ticks = 4): { top: number; step: number; n: number } {
  const raw = Math.max(max, 1) / ticks;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const frac = raw / pow;
  const step = Math.max(1, (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow);
  const n = Math.max(2, Math.ceil(max / step));
  return { top: step * n, step, n };
}

/** Smooth curve through points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(pts: Point[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** useId() returns ids with colons, which break url(#...) references in SVG. */
export const svgId = (raw: string) => raw.replace(/:/g, '');
