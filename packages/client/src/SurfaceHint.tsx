// I-677: the page notices it is on the wrong screen and offers the other one — the join page on
// a big screen with a mouse, the TV page on a phone. B: a phone-sized card with the two choices.
// C: the answer is remembered on this device (a screen that chose the TV goes there by itself).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import styles from './SurfaceHint.module.css';

const DISMISSED = 'pb.surfaceHint.dismissed';
/** C: what this device answered — 'tv' (it is the big screen) or 'player' / 'keep' (never ask). */
const CHOICE = 'pb.surfaceHint.choice';

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
    () => looksLikeBigScreen() && get('session', DISMISSED) === null && get('local', CHOICE) !== 'player',
  );
  const code = roomParam();
  const tvHref = `/tv${code ? `?room=${code}` : ''}`;
  // C: a screen that chose the TV before goes there by itself after 3 s, unless told to stay
  const [countdown, setCountdown] = useState<number | null>(() =>
    show && get('local', CHOICE) === 'tv' ? 3 : null,
  );
  useEffect(() => {
    if (countdown === null) return undefined;
    if (countdown <= 0) {
      location.assign(tvHref);
      return undefined;
    }
    const h = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(h);
  }, [countdown, tvHref]);
  if (!show) return null;
  const dismiss = (): void => {
    set('session', DISMISSED, '1');
    set('local', CHOICE, 'player');
    setShow(false);
  };
  const openTv = (): void => set('local', CHOICE, 'tv');
  if (countdown !== null)
    return (
      <div className={`${styles.card} ${styles.floating}`} role="status">
        <p className={styles.cardTitle}>📺 Opening the TV view… {Math.max(countdown, 0)}</p>
        <p className={styles.cardText}>This screen was the TV last time.</p>
        <div className={styles.cardActions}>
          <a className={styles.primary} href={tvHref}>
            Open it now
          </a>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setCountdown(null);
              dismiss();
            }}
          >
            Stay here — I'm playing
          </button>
        </div>
      </div>
    );
  return (
    <div className={`${styles.card} ${styles.floating}`} role="region" aria-label="Is this the TV?">
      <p className={styles.cardTitle}>📺 Is this the TV?</p>
      <p className={styles.cardText}>
        This page is for joining from a phone. The big screen everyone watches opens the TV view.
      </p>
      <div className={styles.cardActions}>
        <a className={styles.primary} href={tvHref} onClick={openTv}>
          Yes — open the TV view
        </a>
        <button type="button" className={styles.secondary} onClick={dismiss}>
          No, I'm playing here
        </button>
      </div>
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
    () => looksLikePhone() && get('session', DISMISSED) === null && get('local', CHOICE) !== 'keep',
  );
  const unzoom = useUnzoom();
  if (!show) return null;
  const joinHref = `/${code ? `?room=${code}` : ''}`;
  const keep = (): void => {
    set('session', DISMISSED, '1');
    set('local', CHOICE, 'keep');
    setShow(false);
  };
  return (
    <div className={styles.cover} style={{ zoom: unzoom }}>
      <div className={styles.card} role="region" aria-label="This is the TV page">
        <p className={styles.cardTitle}>📺 This is the TV page</p>
        <p className={styles.cardText}>
          It goes on the big screen everyone watches — the code and the QR are for phones to scan.
          On this phone you probably want to play.
        </p>
        <div className={styles.cardActions}>
          <a className={styles.primary} href={joinHref}>
            📱 Join as a player
          </a>
          <button type="button" className={styles.secondary} onClick={keep}>
            Keep the TV page on this phone
          </button>
        </div>
      </div>
    </div>
  );
}
