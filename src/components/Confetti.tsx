import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas confetti burst. Renders fullscreen for `duration` ms then
 * unmounts itself via the parent. No dependencies, ~140 particles.
 */
export default function Confetti({ duration = 2600, onDone }: { duration?: number; onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    const colors = ['#e94560', '#ff7eb3', '#00e6a8', '#ffc857', '#5ec5ff', '#a855f7', '#ffffff'];
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.42;

    type P = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number; shape: 'rect' | 'circle' };
    const parts: P[] = Array.from({ length: 150 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      };
    });

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const gravity = 0.22;
      for (const p of parts) {
        p.vy += gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - elapsed / duration);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [duration, onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1500 }}
    />
  );
}
