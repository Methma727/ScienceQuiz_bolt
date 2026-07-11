import { useEffect } from 'react';
import { sound } from '../lib/sound';

/**
 * Attaches a single document-level listener that plays a click cue on
 * interactive elements, so every button across the app gets feedback without
 * each component wiring it up. The AudioContext is also unlocked here on the
 * first user gesture.
 */
export default function GlobalSound() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      // Unlock the AudioContext on the first gesture.
      sound.ensure();
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, [role="button"], .switch, .radio-option, .tab')) {
        sound.play('click');
      }
    };
    const onPointerEnter = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, [role="button"], .switch, .radio-option, .tab, .option-btn')) {
        sound.play('hover');
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerenter', onPointerEnter, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerenter', onPointerEnter, true);
    };
  }, []);

  return null;
}
