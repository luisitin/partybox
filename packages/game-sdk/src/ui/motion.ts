// `prefers-reduced-motion` for JS-driven motion (CSS durations already collapse to 0 via tokens),
// and `useBeats` for sequenced reveals (a card, then the voters, then the author, then the points).
import { useEffect, useState, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => undefined;
  const mql = matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function snapshot(): boolean {
  return typeof matchMedia === 'function' && matchMedia(QUERY).matches;
}

// ── the in-app motion switch (loop 311, the owner) ──────────────────────────────────────────
// A viewer may turn motion off in the app — a phone's card-style sheet — without touching the OS
// setting. Stored per device; stamped on <html data-motion="off"> so tokens.css collapses the
// motion durations the way it does for prefers-reduced-motion; read here so JS-driven motion
// (rises, sequences, keyed pops) follows too.
const MOTION_KEY = 'partybox:motion';
const motionListeners = new Set<() => void>();
let motionOff: boolean | null = null;

function readMotionOff(): boolean {
  if (motionOff !== null) return motionOff;
  try {
    motionOff = localStorage.getItem(MOTION_KEY) === 'off';
  } catch {
    motionOff = false;
  }
  return motionOff;
}

/** Stamp the stored choice on <html>; call once at boot, before the first render. */
export function applyMotionPreference(): void {
  if (typeof document === 'undefined') return;
  if (readMotionOff()) document.documentElement.dataset['motion'] = 'off';
  else delete document.documentElement.dataset['motion'];
}

export function setMotionOff(off: boolean): void {
  motionOff = off;
  try {
    if (off) localStorage.setItem(MOTION_KEY, 'off');
    else localStorage.removeItem(MOTION_KEY);
  } catch {
    /* private mode: the choice lasts the session */
  }
  applyMotionPreference();
  for (const l of motionListeners) l();
}

function subscribeMotion(cb: () => void): () => void {
  motionListeners.add(cb);
  return () => motionListeners.delete(cb);
}

/** The in-app switch alone (the sheet shows it); `usePrefersReducedMotion` folds it in. */
export function useMotionOff(): boolean {
  return useSyncExternalStore(subscribeMotion, readMotionOff, () => false);
}

/**
 * True when the viewer wants less motion — the OS setting OR the in-app switch; sequences should
 * then show at once and cards switch without a rise.
 */
export function usePrefersReducedMotion(): boolean {
  const os = useSyncExternalStore(subscribe, snapshot, () => false);
  const app = useMotionOff();
  return os || app;
}

/**
 * The index of the current beat of a client-side sequence: `useBeats([0, 300, 900, 1500])` is 0
 * at mount, 1 after 300 ms, … and stays at the last index. Under reduced motion it is the last
 * index from the first render, so everything shows at once. Remount (a `key`) to restart it.
 */
export function useBeats(atMs: readonly number[]): number {
  const reduced = usePrefersReducedMotion();
  const last = Math.max(0, atMs.length - 1);
  const [beat, setBeat] = useState(reduced ? last : atMs[0] === 0 ? 0 : -1);
  // The schedule is fixed per mount (callers pass a literal array); only `reduced` can change.
  useEffect(() => {
    if (reduced) return;
    const handles = atMs.map((ms, i) => setTimeout(() => setBeat((b) => Math.max(b, i)), ms));
    return () => handles.forEach((h) => clearTimeout(h));
  }, [reduced]);
  return reduced ? last : beat;
}

/**
 * Beats that are sequencing, not decoration (a claim reveal: announce, card, cells, verdict): the
 * schedule runs under reduced motion too, only the movement between beats is dropped there.
 */
export function useSequence(atMs: readonly number[]): number {
  const [beat, setBeat] = useState(atMs[0] === 0 ? 0 : -1);
  // The schedule is fixed per mount (callers pass a literal array; remount to restart), so the
  // effect keys on its serialised form rather than the array identity.
  const key = atMs.join(',');
  useEffect(() => {
    const handles = key
      .split(',')
      .map((ms, i) => setTimeout(() => setBeat((b) => Math.max(b, i)), Number(ms)));
    return () => handles.forEach((h) => clearTimeout(h));
  }, [key]);
  return beat;
}

/**
 * A phone-side hold: false on the first render for a given `key`, true `ms` later (cleared and
 * restarted when the key changes; `ms <= 0` is true at once). Deliberately NOT gated on reduced
 * motion — it is sequencing, not motion: the TV is another device with its own setting, and the
 * phone must never show a result before the TV has (DESIGN_SYSTEM principle 5).
 */
export function useHold(key: string | number | null, ms: number): boolean {
  const [held, setHeld] = useState<{ key: string | number | null; done: boolean }>({
    key,
    done: false,
  });
  // "Adjust state when a prop changes": a new key restarts the hold.
  if (held.key !== key) setHeld({ key, done: false });
  useEffect(() => {
    if (ms <= 0) return;
    const handle = setTimeout(
      () => setHeld((s) => (s.key === key && !s.done ? { key, done: true } : s)),
      ms,
    );
    return () => clearTimeout(handle);
  }, [key, ms]);
  return ms <= 0 || (held.key === key && held.done);
}

/** The motion tokens in ms (tokens.css), for JS-driven sequences that must line up with CSS. */
export const MOTION_FAST = 150;
export const MOTION_BASE = 300;
export const MOTION_SLOW = 600;

/**
 * Counts from `from` to `target` over `ms` (cubic ease-out, requestAnimationFrame) after
 * `delayMs`; returns `target` at once when from === target, ms <= 0 or the viewer prefers
 * reduced motion. Restarts when any argument changes.
 */
export function useCountUp(target: number, from: number, ms: number, delayMs = 0): number {
  const reduced = usePrefersReducedMotion();
  const still = reduced || ms <= 0 || from === target;
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (still) return;
    let raf = 0;
    let startedAt = 0;
    const tick = (t: number): void => {
      if (!startedAt) startedAt = t;
      const p = Math.min(1, (t - startedAt) / ms);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, from, ms, delayMs, still]);
  return still ? target : value;
}

/**
 * Makes a DOM snapshot (cloneNode of a leaving screen) pure scenery: no ids, labels or names that a
 * screen reader, a test locator or the keyboard could confuse with the live screen underneath.
 */
export function sanitizeSnapshot(node: HTMLElement): HTMLElement {
  node.setAttribute('inert', '');
  node.setAttribute('aria-hidden', 'true');
  // Form controls become inert spans that keep the look (class + inline style + text): a wrapping
  // <label> would otherwise still associate them, so screen readers and test locators found two
  // "Your name" fields during the crossfade.
  for (const el of node.querySelectorAll<HTMLElement>('input, textarea, select')) {
    const span = node.ownerDocument.createElement('span');
    span.className = el.className;
    span.style.cssText = el.style.cssText;
    span.textContent =
      el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
        ? el.value
        : el.textContent;
    el.replaceWith(span);
  }
  for (const el of node.querySelectorAll<HTMLElement>('*')) {
    for (const attr of ['id', 'for', 'name', 'aria-label', 'aria-labelledby', 'aria-live', 'role'])
      el.removeAttribute(attr);
    el.tabIndex = -1;
    if (el instanceof HTMLButtonElement) el.disabled = true; // keeps its layout, loses its tap
  }
  return node;
}
