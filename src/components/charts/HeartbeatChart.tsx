import { useEffect, useRef } from 'react';
import type { TimeUnit } from '@/types/models';
import { useElementSize } from '@/hooks/useElementSize';

export interface HeartbeatSeries {
  key: string;
  label: string;
  color: string; // 7-character hex, e.g. #34d399
  value: number;
}

/** Faster scales scroll faster and beat quicker. */
const UNIT_SPEED: Record<TimeUnit, number> = { second: 1.8, minute: 1.4, hour: 1.1, day: 0.9, month: 0.7, year: 0.5 };

const gauss = (x: number, mu: number, sigma: number, amp: number) => {
  const d = (x - mu) / sigma;
  return amp * Math.exp(-(d * d) / 2);
};

/** One ECG beat: P wave, QRS spike, T wave. Input is the position within the beat (0 to 1). */
const beat = (p: number) =>
  gauss(p, 0.14, 0.035, 0.16) + gauss(p, 0.27, 0.012, -0.14) + gauss(p, 0.3, 0.011, 1) + gauss(p, 0.335, 0.013, -0.28) + gauss(p, 0.58, 0.06, 0.28);

const bpm = (value: number) => 38 + value * 14;

interface HeartbeatChartProps {
  series: HeartbeatSeries[];
  unit: TimeUnit;
  height?: number;
}

/** Scrolling monitor-style traces. One lane per series; more jobs means a faster, taller pulse. */
export function HeartbeatChart({ series, unit, height = 270 }: HeartbeatChartProps) {
  const [boxRef, { width }] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ series, unit });
  live.current = { series, unit };

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
    const t0 = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const { series: lanes, unit: u } = live.current;
      const speed = UNIT_SPEED[u];
      const pxPerSec = 110 * speed;
      const laneH = height / Math.max(1, lanes.length);
      ctx.clearRect(0, 0, width, height);

      lanes.forEach((s, li) => {
        const mid = li * laneH + laneH * 0.64;
        const amp = laneH * 0.5 * Math.min(1, 0.4 + s.value * 0.13);
        const beatsPerSec = (bpm(s.value) / 60) * (0.6 + 0.5 * speed);
        const offset = li * 0.37;
        const yAt = (x: number) => {
          const tx = t - (width - x) / pxPerSec;
          const p = (((tx * beatsPerSec + offset) % 1) + 1) % 1;
          return mid - beat(p) * amp + Math.sin(tx * 7 + li) * 0.5;
        };

        ctx.save();
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, mid);
        ctx.lineTo(width, mid);
        ctx.stroke();
        ctx.restore();

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, `${s.color}00`);
        grad.addColorStop(0.55, `${s.color}99`);
        grad.addColorStop(1, s.color);

        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          if (x === 0) ctx.moveTo(x, yAt(x));
          else ctx.lineTo(x, yAt(x));
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width - 3, yAt(width - 3), 3.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  const laneH = height / Math.max(1, series.length);

  return (
    <div ref={boxRef} className="heartbeat" style={{ height }}>
      <canvas ref={canvasRef} style={{ width, height }} aria-label="Live heartbeat traces for queued, processing and failed jobs" role="img" />
      {series.map((s, i) => (
        <div key={s.key} className="hb-label" style={{ top: i * laneH + 8 }}>
          <span className="hb-heart" style={{ color: s.color, animationDuration: `${60 / bpm(s.value)}s` }}>♥</span>
          <span className="hb-value" style={{ color: s.color }}>{s.value}</span>
          <span className="hb-name">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
