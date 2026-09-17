// Card styles for the Bingo phone (owner picks, 2026-09-17): Focus (one big card + thumbnails,
// the default), Grid, Stack, Side by side and Strip — each says how many cards it suits and how
// the phone must be held. A wide screen (tablet, computer) ignores all that and lays every card
// out full size. The choice is per phone and remembered like the theme.
import { useEffect, useSyncExternalStore } from 'react';

export type CardStyle = 'focus' | 'grid' | 'stack' | 'side' | 'strip';
export type Orientation = 'portrait' | 'landscape';

export interface StyleSpec {
  id: CardStyle;
  label: string;
  hint: string;
  orient: Orientation;
  /** Card counts this style is for. */
  cards: readonly number[];
}

export const STYLES: readonly StyleSpec[] = [
  {
    id: 'focus',
    label: 'Focus',
    hint: 'one big card + thumbnails',
    orient: 'portrait',
    cards: [1, 2, 3, 4],
  },
  { id: 'grid', label: 'Grid', hint: 'all cards at once', orient: 'portrait', cards: [3, 4] },
  { id: 'stack', label: 'Stack', hint: 'two cards, upright', orient: 'portrait', cards: [2] },
  {
    id: 'side',
    label: 'Side by side',
    hint: 'two cards, sideways',
    orient: 'landscape',
    cards: [2],
  },
  { id: 'strip', label: 'Strip', hint: '3–4 cards, sideways', orient: 'landscape', cards: [3, 4] },
];

export function styleSpec(id: CardStyle): StyleSpec {
  return STYLES.find((s) => s.id === id) ?? (STYLES[0] as StyleSpec);
}

/** Why a style is greyed out for this many cards; '' when it fits. */
export function styleReason(spec: StyleSpec, cards: number): string {
  if (spec.cards.includes(cards)) return '';
  const first = spec.cards[0] ?? 1;
  const last = spec.cards[spec.cards.length - 1] ?? first;
  return first === last ? `${first} cards only` : `${first}–${last} cards only`;
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
