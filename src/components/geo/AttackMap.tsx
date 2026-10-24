import { useEffect, useRef, useState } from 'react';
import type { AttackEvent } from '@/types/models';
import { useElementSize } from '@/hooks/useElementSize';

const SEV_COLOR: Record<string, string> = { critical: '#f43f5e', high: '#fb923c', medium: '#fbbf24', low: '#38bdf8', info: '#94a3b8' };

interface AttackMapProps {
  events: AttackEvent[];
  height?: number;
}

/**
 * Flat dark world grid with animated point-to-point arcs between aggregate
 * attacker and asset locations (city/region/country only). Click an arc's
 * endpoint to zoom the view toward that region — a wider "live zoom", not a
 * precise address.
 */
export function AttackMap({ events, height = 360 }: AttackMapProps) {
  const [boxRef, { width }] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<{ cx: number; cy: number; scale: number } | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const hits = useRef<Array<{ x: number; y: number; label: string; zoomTo: { cx: number; cy: number } }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const project = (lat: number, lng: number) => ({ x: ((lng + 180) / 360) * width, y: ((90 - lat) / 180) * height });
    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      if (zoom) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom.scale, zoom.scale);
        ctx.translate(-zoom.cx, -zoom.cy);
      }

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1 / (zoom?.scale ?? 1);
      for (let gx = 0; gx <= width; gx += width / 16) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke(); }
      for (let gy = 0; gy <= height; gy += height / 10) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke(); }

      const localHits: typeof hits.current = [];

      events.forEach((e, i) => {
        const a = project(e.src_lat, e.src_lng);
        const b = project(e.dst_lat, e.dst_lng);
        const mx = (a.x + b.x) / 2;
        const my = Math.min(a.y, b.y) - Math.max(26, Math.abs(a.x - b.x) * 0.18);
        const color = SEV_COLOR[e.severity] ?? '#38bdf8';

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = `${color}55`;
        ctx.lineWidth = 1.3 / (zoom?.scale ?? 1);
        ctx.stroke();

        const p = ((t * 0.35 + i * 0.13) % 1);
        const qx = (1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * mx + p * p * b.x;
        const qy = (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * my + p * p * b.y;
        ctx.beginPath();
        ctx.arc(qx, qy, 2.4 / Math.sqrt(zoom?.scale ?? 1), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        [[a, `${e.src_city}, ${e.src_region}, ${e.src_country}`], [b, `${e.dst_city}, ${e.dst_region}, ${e.dst_country}`]].forEach(([pt, label]) => {
          const pos = pt as { x: number; y: number };
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 3 / Math.sqrt(zoom?.scale ?? 1), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          localHits.push({ x: pos.x, y: pos.y, label: label as string, zoomTo: { cx: pos.x, cy: pos.y } });
        });
      });

      hits.current = localHits;
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height, events, zoom]);

  const toWorld = (mx: number, my: number) => {
    if (!zoom) return { x: mx, y: my };
    return { x: (mx - width / 2) / zoom.scale + zoom.cx, y: (my - height / 2) / zoom.scale + zoom.cy };
  };

  const findNear = (mx: number, my: number) => {
    const w = toWorld(mx, my);
    const r = zoom ? 10 : 9;
    return hits.current.find((h) => Math.hypot(h.x - w.x, h.y - w.y) < r);
  };

  return (
    <div ref={boxRef} className="attack-map" style={{ height }}>
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        role="img"
        aria-label="Live map of aggregate attack traffic between cities"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const hit = findNear(e.clientX - rect.left, e.clientY - rect.top);
          setHover(hit ? { x: e.clientX - rect.left, y: e.clientY - rect.top, text: hit.label } : null);
        }}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const hit = findNear(e.clientX - rect.left, e.clientY - rect.top);
          if (hit) setZoom((z) => (z ? null : { cx: hit.zoomTo.cx, cy: hit.zoomTo.cy, scale: 3.2 }));
        }}
      />
      {hover && (
        <div className="attack-map-tip" style={{ left: Math.min(hover.x + 10, width - 190), top: Math.max(hover.y - 34, 4) }}>
          {hover.text}
        </div>
      )}
      <div className="attack-map-controls">
        <button type="button" className="icon-btn" onClick={() => setZoom(null)} aria-label="Reset zoom" title="Reset zoom" disabled={!zoom}>↺</button>
        <span className="attack-map-hint">{zoom ? 'Click the point again to zoom out' : 'Click a point to zoom in · city/country level only'}</span>
      </div>
    </div>
  );
}
