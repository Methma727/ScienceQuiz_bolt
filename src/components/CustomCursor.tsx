import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * A two-part custom cursor: a precise dot that tracks instantly, and a
 * lagging ring that eases toward the pointer. The ring grows on interactive
 * hover targets and contracts on click. Disabled on touch devices.
 */
export default function CustomCursor() {
  const { customCursor, reducedMotion } = useSettings();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customCursor) return;

    // Skip on coarse pointers (touch / pen).
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest(
        'a, button, input, textarea, select, label, [role="button"], [data-cursor="hover"]',
      );
      ring.classList.toggle('hovering', interactive);
    };

    const onDown = () => ring.classList.add('clicking');
    const onUp = () => ring.classList.remove('clicking');
    const onLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const onEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    // Ease the ring toward the pointer each frame.
    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
    };
  }, [customCursor, reducedMotion]);

  if (!customCursor) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} aria-hidden />
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} aria-hidden />
    </>
  );
}
