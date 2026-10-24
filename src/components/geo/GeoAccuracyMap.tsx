import { useEffect, useRef, useState } from 'react';
import { useElementSize } from '@/hooks/useElementSize';

interface GeoAccuracyMapProps {
  lat: number;
  lng: number;
  city: string;
  accuracyKm: number;
  height?: number;
}

/**
 * Flat equirectangular grid showing one point with a large translucent
 * "approximate area" ring — not a pin, not a zoom-to-address. The ring is
 * drawn deliberately big so it reads as "somewhere in here", matching
 * what city-level IP geolocation actually knows.
 */
export function GeoAccuracyMap({ lat, lng, city, accuracyKm, height = 280 }: GeoAccuracyMapProps) {
  const [boxRef, { width }] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= width; gx += width / 12) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke(); }
    for (let gy = 0; gy <= height; gy += height / 8) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.beginPath(); ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();

    // Visual radius: exaggerated so it clearly reads as a wide, uncertain area, not a pin.
    const baseR = 26 + Math.min(46, accuracyKm / 2.2);
    const pulse = (Math.sin(tick / 12) + 1) / 2;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, baseR + 16);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.beginPath(); ctx.arc(x, y, baseR + 16, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, baseR + pulse * 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [width, height, lat, lng, accuracyKm, tick]);

  return (
    <div ref={boxRef} className="geo-map" style={{ height }}>
      <canvas ref={canvasRef} style={{ width, height }} role="img" aria-label={`Approximate area around ${city}, radius about ${accuracyKm} kilometers`} />
      <span className="geo-map-badge">~{accuracyKm} km radius · city-level estimate, not a precise point</span>
    </div>
  );
}
