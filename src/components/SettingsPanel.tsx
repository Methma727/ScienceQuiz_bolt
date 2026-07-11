import { useEffect, useState } from 'react';
import { useSettings, ACCENTS } from '../context/SettingsContext';
import { sound } from '../lib/sound';
import type { AccentKey } from '../lib/themes';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in settings drawer. Lets the user pick an accent theme and toggle
 * the custom cursor, particle field, sound effects, and reduced motion.
 */
export default function SettingsPanel({ open, onClose }: Props) {
  const s = useSettings();

  // Lock body scroll while open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggle = (key: keyof typeof s, value: boolean, set: (v: boolean) => void) => {
    set(!value);
    sound.play('toggle');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2,2,6,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 260ms',
          zIndex: 2000,
        }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Settings"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(380px, 92vw)',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--glass-border-hover)',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
          transform: open ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform 380ms var(--ease-out-expo)',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid var(--glass-border)' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>Customize</h3>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>Make it yours</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {/* Accent picker */}
          <Section title="Accent Theme" hint="Re-colors the whole app">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(Object.values(ACCENTS) as { key: AccentKey; label: string; c1: string; c2: string }[]).map((a) => {
                const active = s.accent === a.key;
                return (
                  <button
                    key={a.key}
                    onClick={() => { s.setAccent(a.key); sound.play('click'); }}
                    aria-label={a.label}
                    aria-pressed={active}
                    data-cursor="hover"
                    style={{
                      position: 'relative',
                      height: '52px',
                      borderRadius: '14px',
                      border: active ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
                      background: `linear-gradient(135deg, ${a.c1}, ${a.c2})`,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
                      boxShadow: active ? `0 8px 24px ${a.c1}55` : 'none',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
                  >
                    {active && (
                      <span style={{ position: 'absolute', top: '6px', right: '6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Toggles */}
          <Section title="Experience">
            <ToggleRow label="Custom Cursor" desc="Animated glow cursor" checked={s.customCursor} onChange={() => toggle('customCursor', s.customCursor, s.setCustomCursor)} />
            <ToggleRow label="Particle Field" desc="Interactive constellation" checked={s.particles} onChange={() => toggle('particles', s.particles, s.setParticles)} />
            <ToggleRow label="Sound Effects" desc="Subtle UI feedback" checked={s.soundOn} onChange={() => toggle('soundOn', s.soundOn, s.setSoundOn)} />
            <ToggleRow label="Reduced Motion" desc="Calmer animations" checked={s.reducedMotion} onChange={() => toggle('reducedMotion', s.reducedMotion, s.setReducedMotion)} />
          </Section>

          <button
            className="btn btn-ghost btn-small"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={() => { s.resetSettings(); sound.play('click'); }}
          >
            Reset to Defaults
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div className="font-display" style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>{title}</div>
        {hint && <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      data-cursor="hover"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', marginBottom: '8px', cursor: 'pointer', transition: 'background var(--transition-base)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{label}</div>
        <div className="text-muted" style={{ fontSize: '0.76rem' }}>{desc}</div>
      </div>
      <span className={`switch ${checked ? 'active' : ''}`} />
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Re-export a small hook so the floating gear can manage its own state externally if needed.
export function useSettingsToggle() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
