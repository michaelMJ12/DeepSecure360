import { useEffect, useRef, useState } from 'react';
import type { ThreatIndicator } from '@/types/models';
import { useElementSize } from '@/hooks/useElementSize';
import { humanize } from '@/utils/format';

const TYPE_COLOR: Record<string, string> = { ip: '#22d3ee', domain: '#c084fc', hash: '#fb7185', url: '#fbbf24' };

interface Vec3 { x: number; y: number; z: number }

function toVec3(lat: number, lng: number, r: number): Vec3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return { x: -r * Math.sin(phi) * Math.cos(theta), z: r * Math.sin(phi) * Math.sin(theta), y: r * Math.cos(phi) };
}

function rotateY({ x, y, z }: Vec3, a: number): Vec3 {
  return { x: x * Math.cos(a) + z * Math.sin(a), y, z: -x * Math.sin(a) + z * Math.cos(a) };
}
function rotateX({ x, y, z }: Vec3, a: number): Vec3 {
  return { x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) };
}

interface ThreatGlobeProps {
  indicators: ThreatIndicator[];
  height?: number;
  onSelect?: (indicator: ThreatIndicator | null) => void;
}

/**
 * Aggregate threat-intelligence globe: plots IOC indicators by their reporting
 * sensor network's country-level geolocation. Not a live tracker of any individual.
 */
export function ThreatGlobe({ indicators, height = 380, onSelect }: ThreatGlobeProps) {
  const [boxRef, { width }] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ ind: ThreatIndicator; x: number; y: number } | null>(null);
  const dragRef = useRef<{ dragging: boolean; lastX: number; lastY: number; tiltX: number; tiltY: number }>({
    dragging: false, lastX: 0, lastY: 0, tiltX: -0.25, tiltY: 0,
  });
  const screenPts = useRef<Array<{ ind: ThreatIndicator; sx: number; sy: number; vis: boolean }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) / 2 - 26;
    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const drag = dragRef.current;
      const spin = reduceMotion ? 0.6 : 0.6 + t * 0.18;
      ctx.clearRect(0, 0, width, height);

      // Sphere body
      const sphereGrad = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.15, cx, cy, R);
      sphereGrad.addColorStop(0, '#163a4a');
      sphereGrad.addColorStop(0.55, '#0c2433');
      sphereGrad.addColorStop(1, '#040c14');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Graticule: latitude/longitude lines
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.16)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 6) {
          let v = toVec3(lat, lng, R);
          v = rotateY(v, spin);
          v = rotateX(v, drag.tiltX);
          const px = cx + v.x;
          const py = cy - v.y;
          if (v.z < 0) { started = false; continue; }
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let lng = -150; lng <= 180; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 6) {
          let v = toVec3(lat, lng, R);
          v = rotateY(v, spin);
          v = rotateX(v, drag.tiltX);
          const px = cx + v.x;
          const py = cy - v.y;
          if (v.z < 0) { started = false; continue; }
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Indicator points
      screenPts.current = indicators.map((ind) => {
        let v = toVec3(ind.lat, ind.lng, R);
        v = rotateY(v, spin);
        v = rotateX(v, drag.tiltX);
        const sx = cx + v.x;
        const sy = cy - v.y;
        return { ind, sx, sy, vis: v.z > -R * 0.08 };
      });

      screenPts.current.forEach(({ ind, sx, sy, vis }) => {
        if (!vis) return;
        const color = TYPE_COLOR[ind.type] ?? '#22d3ee';
        const pulse = (Math.sin(t * 2.4 + ind.lat) + 1) / 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 7 + pulse * 5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}22`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!reduceMotion || drag.dragging) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height, indicators]);

  const findNear = (mx: number, my: number) =>
    screenPts.current.find((p) => p.vis && Math.hypot(p.sx - mx, p.sy - my) < 9);

  return (
    <div ref={boxRef} className="globe-wrap" style={{ height }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, cursor: dragRef.current.dragging ? 'grabbing' : 'grab' }}
        role="img"
        aria-label="Rotating globe of aggregate threat-intelligence indicator origins"
        onPointerDown={(e) => {
          const d = dragRef.current;
          d.dragging = true;
          d.lastX = e.clientX;
          d.lastY = e.clientY;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => { dragRef.current.dragging = false; }}
        onPointerLeave={() => { dragRef.current.dragging = false; setHover(null); }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (d.dragging) {
            d.tiltX = Math.max(-1.1, Math.min(1.1, d.tiltX - (e.clientY - d.lastY) * 0.006));
            d.lastX = e.clientX;
            d.lastY = e.clientY;
            setHover(null);
            return;
          }
          const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const hit = findNear(mx, my);
          setHover(hit ? { ind: hit.ind, x: mx, y: my } : null);
          if (hit) onSelect?.(hit.ind);
        }}
      />
      {hover && (
        <div className="globe-tooltip" style={{ left: Math.min(hover.x + 14, width - 220), top: Math.min(hover.y + 10, height - 110) }}>
          <strong className="mono">{hover.ind.value}</strong>
          <span>{humanize(hover.ind.type)} · {hover.ind.feed.toUpperCase()} · {hover.ind.country}</span>
          <span>Reputation score <b>{hover.ind.score}</b></span>
          <span className="globe-tags">{hover.ind.tags.map((t) => <i key={t}>{t}</i>)}</span>
        </div>
      )}
      <p className="globe-hint">Drag to rotate · aggregate sensor geolocation, country-level only</p>
    </div>
  );
}
