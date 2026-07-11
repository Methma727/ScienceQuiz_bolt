import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * Layered ambient background:
 *  1. CSS aurora blobs (slowly drifting gradient orbs)
 *  2. A canvas particle constellation that connects nearby points and reacts
 *     to the pointer (gentle repulsion + link highlighting)
 *  3. A mouse-following radial spotlight
 *
 * Particle count auto-scales with viewport area and pauses when off-screen or
 * when reduced motion is requested.
 */
export default function AnimatedBackground() {
  const { particles, reducedMotion } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Mouse spotlight (kept lightweight, independent of particles).
  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    if (reducedMotion) {
      el.style.opacity = '0';
      return;
    }
    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.background = `radial-gradient(600px circle at ${cx}px ${cy}px, var(--accent-soft), transparent 70%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // Particle constellation.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!particles || reducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Density scales with area, capped so it stays performant.
    const count = Math.min(110, Math.max(36, Math.floor((width * height) / 18000)));
    const points: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
      });
    }

    const mouse = { x: -1000, y: -1000 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('resize', resize);

    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#e94560';

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 130;
      const col = accent();

      for (const p of points) {
        // Gentle pointer repulsion.
        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 150) {
          const f = (150 - dm) / 150;
          p.vx += (dxm / dm) * f * 0.25;
          p.vy += (dym / dm) * f * 0.25;
        }

        p.x += p.vx;
        p.y += p.vy;
        // friction keeps velocities bounded.
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around edges.
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fill();
      }

      // Connecting lines.
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.32;
            ctx.strokeStyle = hexToRgba(col, alpha);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // Highlight links to the pointer.
        const pa = points[i];
        const pd = Math.hypot(pa.x - mouse.x, pa.y - mouse.y);
        if (pd < 170) {
          ctx.strokeStyle = hexToRgba(col, (1 - pd / 170) * 0.6);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [particles, reducedMotion]);

  return (
    <div className="qm-bg" aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Base gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, #11111c 0%, var(--bg-primary) 55%)' }} />

      {/* Aurora blobs */}
      {!reducedMotion && (
        <>
          <span className="qm-blob qm-blob-1" />
          <span className="qm-blob qm-blob-2" />
          <span className="qm-blob qm-blob-3" />
        </>
      )}

      {/* Particle constellation */}
      {particles && !reducedMotion && (
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      )}

      {/* Mouse spotlight */}
      <div ref={spotlightRef} style={{ position: 'absolute', inset: 0, opacity: reducedMotion ? 0 : 1, transition: 'opacity 400ms' }} />

      {/* Subtle noise + vignette via inline styles to avoid extra assets */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 240px 60px rgba(0,0,0,0.6)' }} />

      <style>{`
        .qm-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.5;
          will-change: transform;
        }
        .qm-blob-1 {
          width: 520px; height: 520px;
          background: var(--accent-1);
          top: -120px; left: -100px;
          animation: qmFloat1 22s var(--ease-out-expo) infinite alternate;
        }
        .qm-blob-2 {
          width: 460px; height: 460px;
          background: var(--accent-2);
          bottom: -140px; right: -120px;
          animation: qmFloat2 26s var(--ease-out-expo) infinite alternate;
        }
        .qm-blob-3 {
          width: 380px; height: 380px;
          background: #6d5bd0;
          top: 40%; left: 55%;
          opacity: 0.32;
          animation: qmFloat3 30s var(--ease-out-expo) infinite alternate;
        }
        @keyframes qmFloat1 { from { transform: translate(0,0) scale(1); } to { transform: translate(120px, 90px) scale(1.15); } }
        @keyframes qmFloat2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-100px, -70px) scale(1.1); } }
        @keyframes qmFloat3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-140px, 80px) scale(1.2); } }
      `}</style>
    </div>
  );
}

/** Convert a #rrggbb string to an rgba() string with the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full || 'e94560', 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
