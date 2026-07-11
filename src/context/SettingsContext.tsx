/**
 * Global UI settings: accent theme, custom cursor, particles, and sound.
 * All persisted to localStorage and applied to the document via CSS variables.
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { ACCENTS, applyAccent, type AccentKey } from '../lib/themes';
import { sound } from '../lib/sound';

export interface SettingsState {
  accent: AccentKey;
  customCursor: boolean;
  particles: boolean;
  soundOn: boolean;
  reducedMotion: boolean;
}

interface SettingsContextValue extends SettingsState {
  setAccent: (a: AccentKey) => void;
  setCustomCursor: (v: boolean) => void;
  setParticles: (v: boolean) => void;
  setSoundOn: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  resetSettings: () => void;
}

const STORAGE_KEY = 'qm_settings_v1';

const DEFAULTS: SettingsState = {
  accent: 'rose',
  customCursor: true,
  particles: true,
  soundOn: true,
  reducedMotion: false,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>(loadSettings);

  // Persist + apply side effects whenever settings change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyAccent(state.accent);
    sound.enabled = state.soundOn;
    document.body.classList.toggle('custom-cursor-active', state.customCursor);
  }, [state]);

  const update = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const value: SettingsContextValue = {
    ...state,
    setAccent: (a) => update('accent', a),
    setCustomCursor: (v) => update('customCursor', v),
    setParticles: (v) => update('particles', v),
    setSoundOn: (v) => update('soundOn', v),
    setReducedMotion: (v) => update('reducedMotion', v),
    resetSettings: () => setState(DEFAULTS),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export { ACCENTS };
