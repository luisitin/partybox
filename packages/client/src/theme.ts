// Themes: named colour palettes in tokens.css, switched by `data-theme` on <html>. Per device
// (localStorage) — the TV and each phone pick their own; nothing goes over the wire.
import { useSyncExternalStore } from 'react';

export type ThemeId = 'night' | 'daylight' | 'arcade' | 'cabin' | 'contrast';

export interface ThemeSpec {
  id: ThemeId;
  label: string;
  /** One-line hint shown in pickers. */
  hint: string;
  /** Three swatch colours (bg, accent, accent-2) so a picker can preview without applying. */
  swatch: [string, string, string];
}

export const THEMES: readonly ThemeSpec[] = [
  {
    id: 'night',
    label: 'Neon Night',
    hint: 'the default — dim room',
    swatch: ['#0f1020', '#ff5d8f', '#ffd166'],
  },
  {
    id: 'daylight',
    label: 'Daylight',
    hint: 'bright room, light background',
    swatch: ['#f6f5ff', '#d81b60', '#7a4b00'],
  },
  {
    id: 'arcade',
    label: 'Retro Arcade',
    hint: 'magenta + cyan on black',
    swatch: ['#050014', '#ff2bd6', '#00f0ff'],
  },
  {
    id: 'cabin',
    label: 'Cozy Cabin',
    hint: 'warm browns and gold',
    swatch: ['#1d1410', '#e8743b', '#f2c14e'],
  },
  {
    id: 'contrast',
    label: 'High Contrast',
    hint: 'black, white, yellow',
    swatch: ['#000000', '#ff4fa3', '#ffff00'],
  },
];

const KEY = 'partybox:theme';
const DEFAULT: ThemeId = 'night';
const listeners = new Set<() => void>();
/** What is on <html> right now (a ?theme= override may differ from the stored choice). */
let current: ThemeId | null = null;

function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

export function getTheme(): ThemeId {
  if (current) return current;
  try {
    const stored = localStorage.getItem(KEY);
    return isThemeId(stored) ? stored : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

/** Stamp the stored theme on <html>; call once at boot (before the first render). */
export function applyTheme(id: ThemeId = getTheme()): void {
  current = id;
  if (id === DEFAULT) delete document.documentElement.dataset['theme'];
  else document.documentElement.dataset['theme'] = id;
}

export function setTheme(id: ThemeId): void {
  try {
    if (id === DEFAULT) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, id);
  } catch {
    /* private mode: the choice lasts until reload */
  }
  applyTheme(id);
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useTheme(): ThemeId {
  return useSyncExternalStore(subscribe, getTheme, () => DEFAULT);
}
