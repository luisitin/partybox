// Card styles for the Bingo phone (owner picks, 2026-09-17): Focus (one big card + thumbnails,
// the default), Grid, Stack, Side by side and Strip — each says how many cards it suits and how
// the phone must be held. A wide screen (tablet, computer) ignores all that and lays every card
// out full size. The choice is per phone and remembered like the theme. The names and hints the
// players read live in words.ts, in the device's language.
import { useEffect, useSyncExternalStore } from 'react';
import type { Translator } from '@partybox/game-sdk/ui';

export type CardStyle = 'focus' | 'grid' | 'stack' | 'side' | 'strip';
export type Orientation = 'portrait' | 'landscape';

export interface StyleSpec {
  id: CardStyle;
  orient: Orientation;
  /** Card counts this style is for. */
  cards: readonly number[];
}

export const STYLES: readonly StyleSpec[] = [
  { id: 'focus', orient: 'portrait', cards: [1, 2, 3, 4] },
  { id: 'grid', orient: 'portrait', cards: [3, 4] },
  { id: 'stack', orient: 'portrait', cards: [2] },
  { id: 'side', orient: 'landscape', cards: [2] },
  { id: 'strip', orient: 'landscape', cards: [3, 4] },
];

export function styleSpec(id: CardStyle): StyleSpec {
  return STYLES.find((s) => s.id === id) ?? (STYLES[0] as StyleSpec);
}

/** Why a style is greyed out for this many cards; '' when it fits. */
export function styleReason(spec: StyleSpec, cards: number, L: Translator): string {
  if (spec.cards.includes(cards)) return '';
  const first = spec.cards[0] ?? 1;
  const last = spec.cards[spec.cards.length - 1] ?? first;
  return first === last
    ? L('{n} cards only', { n: first })
    : L('{first}–{last} cards only', { first, last });
}

const KEY = 'partybox:bingo-style';
const listeners = new Set<() => void>();
let stored: CardStyle | null = null;

function isStyle(v: string | null): v is CardStyle {
  return STYLES.some((s) => s.id === v);
}

function readStored(): CardStyle {
  if (stored) return stored;
  try {
    const v = localStorage.getItem(KEY);
    stored = isStyle(v) ? v : 'focus';
  } catch {
    stored = 'focus';
  }
  return stored;
}

export function setCardStyle(id: CardStyle): void {
  stored = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // private mode: the choice lasts the session
  }
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The remembered style, or Focus when the remembered one does not suit this many cards. */
export function useCardStyle(cards: number): CardStyle {
  const chosen = useSyncExternalStore(subscribe, readStored, () => 'focus' as CardStyle);
  return styleSpec(chosen).cards.includes(cards) ? chosen : 'focus';
}

// ── how the device is held ─────────────────────────────────────────────────────────────────
const LANDSCAPE = '(orientation: landscape)';
/** A phone, as opposed to a tablet or a computer: the short side of the viewport is small. */
const PHONE_MAX_SHORT_SIDE = 600;
export type Held = 'phone-portrait' | 'phone-landscape' | 'wide';

function subscribeHeld(cb: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => undefined;
  const mq = matchMedia(LANDSCAPE);
  mq.addEventListener('change', cb);
  window.addEventListener('resize', cb);
  return () => {
    mq.removeEventListener('change', cb);
    window.removeEventListener('resize', cb);
  };
}
function heldSnapshot(): Held {
  if (typeof matchMedia !== 'function') return 'wide';
  if (Math.min(window.innerWidth, window.innerHeight) > PHONE_MAX_SHORT_SIDE) return 'wide';
  return matchMedia(LANDSCAPE).matches ? 'phone-landscape' : 'phone-portrait';
}
export function useHeld(): Held {
  return useSyncExternalStore(subscribeHeld, heldSnapshot, () => 'wide' as Held);
}

/** The orientation a phone must turn to for this style, or null when it is fine (or wide). */
export function turnNeeded(style: CardStyle, held: Held): Orientation | null {
  if (held === 'wide') return null;
  const want = styleSpec(style).orient;
  return (held === 'phone-landscape') === (want === 'landscape') ? null : want;
}

/**
 * Once the phone is held the right way, keep it there where the browser allows (Android Chrome
 * in full screen; iOS ignores the request). Best effort: a refusal is not an error.
 */
export function useOrientationLock(wanted: Orientation | null): void {
  useEffect(() => {
    const api = (
      screen as Screen & {
        orientation?: { lock?: (o: string) => Promise<void>; unlock?: () => void };
      }
    ).orientation;
    if (!wanted || !api?.lock) return;
    api.lock(wanted).catch(() => undefined);
    return () => api.unlock?.();
  }, [wanted]);
}

// ── S-002: the daub's look and ink, per phone (localStorage, like the card style). Applied as
// data attributes on <html> so the card's CSS can pick them up without props.
// Blot: the ink blot; Stamp: the flat fill; Ring: a ring round the number (names: words.ts).
export type DaubStyle = 'blot' | 'stamp' | 'ring';
export const DAUBS: readonly { id: DaubStyle }[] = [
  { id: 'blot' },
  { id: 'stamp' },
  { id: 'ring' },
];
export type Ink = 'mine' | 'pink' | 'gold' | 'green';
export const INKS: readonly { id: Ink; css: string | null }[] = [
  { id: 'mine', css: null },
  { id: 'pink', css: 'var(--pb-accent)' },
  { id: 'gold', css: 'var(--pb-accent-2)' },
  { id: 'green', css: 'var(--pb-accent-3)' },
];
const DAUB_KEY = 'partybox:bingo-daub';
const INK_KEY = 'partybox:bingo-ink';
const daubListeners = new Set<() => void>();
function readKey<T extends string>(key: string, ok: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return ok.includes(v as T) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}
function applyDaubAttrs(): void {
  const root = document.documentElement;
  root.dataset['daub'] = readKey(
    DAUB_KEY,
    DAUBS.map((d) => d.id),
    'blot',
  );
  const ink = INKS.find(
    (i) =>
      i.id ===
      readKey(
        INK_KEY,
        INKS.map((i) => i.id),
        'mine',
      ),
  );
  if (ink?.css) root.style.setProperty('--pb-ink', ink.css);
  else root.style.removeProperty('--pb-ink');
}
export function setDaubStyle(id: DaubStyle): void {
  try {
    localStorage.setItem(DAUB_KEY, id);
  } catch {
    // private mode
  }
  applyDaubAttrs();
  for (const l of daubListeners) l();
}
export function setInk(id: Ink): void {
  try {
    localStorage.setItem(INK_KEY, id);
  } catch {
    // private mode
  }
  applyDaubAttrs();
  for (const l of daubListeners) l();
}
function subscribeDaub(cb: () => void): () => void {
  daubListeners.add(cb);
  return () => daubListeners.delete(cb);
}
export function useDaubStyle(): DaubStyle {
  return useSyncExternalStore(
    subscribeDaub,
    () =>
      readKey(
        DAUB_KEY,
        DAUBS.map((d) => d.id),
        'blot',
      ),
    () => 'blot',
  );
}
export function useInk(): Ink {
  return useSyncExternalStore(
    subscribeDaub,
    () =>
      readKey(
        INK_KEY,
        INKS.map((i) => i.id),
        'mine',
      ),
    () => 'mine',
  );
}
if (typeof document !== 'undefined') applyDaubAttrs();

// ── I-126 A: a tablet's own pick. The all-cards tablet layout stays its default ('all'); a style
// picked ON a wide screen is remembered apart from the phone's, so one never reshapes the other.
export type TabletStyle = CardStyle | 'all';
const TABLET_KEY = 'partybox:bingo-style-tablet';
let tabletStored: TabletStyle | null = null;

function readTablet(): TabletStyle {
  if (tabletStored) return tabletStored;
  try {
    const v = localStorage.getItem(TABLET_KEY);
    tabletStored = v === 'all' || isStyle(v) ? (v as TabletStyle) : 'all';
  } catch {
    tabletStored = 'all';
  }
  return tabletStored;
}

export function setTabletStyle(id: TabletStyle): void {
  tabletStored = id;
  try {
    localStorage.setItem(TABLET_KEY, id);
  } catch {
    // private mode: the choice lasts the session
  }
  for (const l of listeners) l();
}

/** The tablet's layout: its own pick when that suits this many cards, else all cards at once. */
export function useTabletStyle(cards: number): TabletStyle {
  const chosen = useSyncExternalStore(subscribe, readTablet, () => 'all' as TabletStyle);
  return chosen === 'all' || styleSpec(chosen).cards.includes(cards) ? chosen : 'all';
}
