/**
 * Accent themes. Each defines a two-stop gradient plus a soft glow color.
 * `applyAccent` writes them to CSS custom properties on :root at runtime,
 * so every part of the UI (buttons, cursor, particles) re-themes instantly.
 */
export type AccentKey = 'rose' | 'violet' | 'ocean' | 'emerald' | 'sunset' | 'gold';

export interface AccentTheme {
  key: AccentKey;
  label: string;
  c1: string;
  c2: string;
  soft: string; // rgba used for glows/halos
}

export const ACCENTS: Record<AccentKey, AccentTheme> = {
  rose: {
    key: 'rose',
    label: 'Aurora Rose',
    c1: '#e94560',
    c2: '#ff7eb3',
    soft: 'rgba(233, 69, 96, 0.15)',
  },
  violet: {
    key: 'violet',
    label: 'Nebula Violet',
    c1: '#a855f7',
    c2: '#ec4899',
    soft: 'rgba(168, 85, 247, 0.16)',
  },
  ocean: {
    key: 'ocean',
    label: 'Deep Ocean',
    c1: '#3b82f6',
    c2: '#22d3ee',
    soft: 'rgba(59, 130, 246, 0.16)',
  },
  emerald: {
    key: 'emerald',
    label: 'Quantum Green',
    c1: '#10b981',
    c2: '#a3e635',
    soft: 'rgba(16, 185, 129, 0.15)',
  },
  sunset: {
    key: 'sunset',
    label: 'Solar Flare',
    c1: '#f97316',
    c2: '#facc15',
    soft: 'rgba(249, 115, 22, 0.16)',
  },
  gold: {
    key: 'gold',
    label: 'Royal Gold',
    c1: '#fbbf24',
    c2: '#f59e0b',
    soft: 'rgba(251, 191, 36, 0.14)',
  },
};

export function applyAccent(key: AccentKey) {
  const theme = ACCENTS[key] ?? ACCENTS.rose;
  const root = document.documentElement;
  root.style.setProperty('--accent-1', theme.c1);
  root.style.setProperty('--accent-2', theme.c2);
  root.style.setProperty('--accent-primary', theme.c1);
  root.style.setProperty('--accent-secondary', theme.c2);
  root.style.setProperty('--accent-soft', theme.soft);
  root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${theme.c1} 0%, ${theme.c2} 100%)`);
}
