// I-677: the page notices it is on the wrong screen and offers the other one — the join page on
// a big screen with a mouse, the TV page on a phone.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import styles from './SurfaceHint.module.css';

const DISMISSED = 'pb.surfaceHint.dismissed';

function get(store: 'local' | 'session', key: string): string | null {
  try {
    return (store === 'local' ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function set(store: 'local' | 'session', key: string, value: string): void {
  try {
    (store === 'local' ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    // private mode: the hint just comes back next time
  }
}

/** A big screen with a mouse: wide, a fine pointer that hovers, no touch points. */
export function looksLikeBigScreen(
  width = window.innerWidth,
  fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  touchPoints = navigator.maxTouchPoints,
): boolean {
  return width >= 1100 && fineHover && touchPoints === 0;
}

/** A phone: a coarse (finger) pointer and a short side under 800 px — a tablet is a fine stage. */
export function looksLikePhone(
  width = window.innerWidth,
  height = window.innerHeight,
  coarse = window.matchMedia('(pointer: coarse)').matches,
): boolean {
  return coarse && Math.min(width, height) < 800;
}

/** The room in this page's address, if any (`?room=ABCD`). */
function roomParam(): string | null {
  const raw = new URLSearchParams(location.search).get('room')?.trim().toUpperCase() ?? '';
  return /^[A-Z]{4}$/.test(raw) ? raw : null;
}

/** On the join page (`/`), before joining: "this looks like a big screen". */
export function BigScreenHint(): JSX.Element | null {
  const [show, setShow] = useState(
    () => looksLikeBigScreen() && get('session', DISMISSED) === null,
  );
  const code = roomParam();
  const tvHref = `/tv${code ? `?room=${code}` : ''}`;
  if (!show) return null;
  const dismiss = (): void => {
    set('session', DISMISSED, '1');
    setShow(false);
  };
  const openTv = (): void => undefined;
  return (
    <div className={styles.banner} role="region" aria-label="Wrong screen?">
      <span>📺 This looks like a big screen —</span>
      <a className={styles.link} href={tvHref} onClick={openTv}>
        Open the TV view
      </a>
      <button type="button" className={styles.close} aria-label="Hide" onClick={dismiss}>
        ✕
      </button>
    </div>
  );
}

/**
 * The TV page's `<html>` is zoomed to fit 1920×1080 into the window (tv/fit.ts) — a fifth on a
 * phone. The hint undoes that zoom so it is phone-sized.
 */
function useUnzoom(): number {
  const read = (): number => {
    const z = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--pb-tv-zoom'),
    );
    return Number.isFinite(z) && z > 0 ? 1 / z : 1;
  };
  const [unzoom, setUnzoom] = useState(read);
  useEffect(() => {
    const on = (): void => setUnzoom(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return unzoom;
}

/** On the TV page (`/tv`) on a phone: "this is the TV page — join as a player". */
export function PhoneOnTvHint({ code }: { code: string | null }): JSX.Element | null {
  const [show, setShow] = useState(
    () => looksLikePhone() && get('session', DISMISSED) === null,
  );
  const unzoom = useUnzoom();
  if (!show) return null;
  const joinHref = `/${code ? `?room=${code}` : ''}`;
  const keep = (): void => {
    set('session', DISMISSED, '1');
    setShow(false);
  };
  return (
    <div className={`${styles.banner} ${styles.bottom}`} style={{ zoom: unzoom }} role="region" aria-label="Wrong screen?">
      <span>📱 This is the TV page —</span>
      <a className={styles.link} href={joinHref}>
        Join as a player
      </a>
      <button type="button" className={styles.close} aria-label="Hide" onClick={keep}>
        ✕
      </button>
    </div>
  );
}
