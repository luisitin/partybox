// The owner (2026-09-22): "sometimes when I reconnect it just spams reconnecting — it just flashes
// reconnecting, reconnecting, reconnecting". A phone on a weak link drops and reconnects several
// times in a row, and a banner wired straight to the socket strobes with it.
//
// One steady message instead:
//   · SHOW_AFTER_MS of trouble before anything is painted — a blip stays invisible;
//   · when the link returns the banner does NOT vanish: it waits STABLE_MS to be sure, and a drop
//     inside that window never even changes the text — the same "Reconnecting…" carries on;
//   · once the link really holds it says "Back online" for a beat and goes;
//   · so six flaps in ten seconds read as one outage, not six.
import { useEffect, useState } from 'react';
import { t as strings } from '../i18n';
import type { Connection } from '../net/controller';
import { useGraceLeft } from './grace';

/** The header dot's label: the link's state in the device's language ("connected" in English, as
 *  the raw state always read). */
export function linkLabel(connection: Connection): string {
  return strings.connection.dot[connection];
}

const SHOW_AFTER_MS = 1200;
/** How long the link must hold before the banner is allowed to say the trouble is over. */
const STABLE_MS = 2500;
/** How long "Back online" stays before the banner goes. */
const SETTLE_MS = 2000;

export type LinkBanner = 'off' | 'trouble' | 'back';

export function useFlapFree(trouble: boolean): LinkBanner {
  const [banner, setBanner] = useState<LinkBanner>('off');
  useEffect(() => {
    // Every transition goes through a timer (0 ms where it is immediate), so the effect never
    // sets state synchronously.
    const next: LinkBanner | null =
      trouble && banner !== 'trouble'
        ? 'trouble'
        : !trouble && banner === 'trouble'
          ? 'back'
          : !trouble && banner === 'back'
            ? 'off'
            : null;
    if (next === null) return undefined;
    // 'trouble' waits out a blip; 'back' waits for the link to actually hold, so a flapping
    // connection shows ONE "Reconnecting…" instead of alternating with "Back online"; 'off' lets
    // the settled line be read.
    const wait =
      next === 'trouble'
        ? banner === 'off'
          ? SHOW_AFTER_MS
          : 0
        : next === 'back'
          ? STABLE_MS
          : SETTLE_MS;
    const h = setTimeout(() => setBanner(next), wait);
    return () => clearTimeout(h);
  }, [trouble, banner]);
  return banner;
}

/** What the banner says: the grace countdown while it is trouble, the settled line after.
 *  `reconnectingLeft` words the countdown ("Reconnecting… 1:42 left") in the device's language. */
export function linkBannerText(
  banner: LinkBanner,
  reconnecting: string,
  backOnline: string,
  secondsLeft: number | null,
  reconnectingLeft: (mmss: string) => string,
): string {
  if (banner === 'back') return backOnline;
  if (secondsLeft === null) return reconnecting;
  const mmss = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;
  return reconnectingLeft(mmss);
}

/** The phone's link banner: whether to show it, and what it says. */
export function useLinkBanner(
  trouble: boolean,
  joined: boolean,
): { showBanner: boolean; text: string } {
  const banner = useFlapFree(trouble);
  // I-089 C: the server's 120 s grace, from the moment this phone saw the socket go.
  const left = useGraceLeft(trouble && joined);
  return {
    showBanner: banner !== 'off',
    text: linkBannerText(
      banner,
      strings.connection.reconnecting,
      strings.connection.backOnline,
      left,
      strings.connection.reconnectingLeft,
    ),
  };
}

/** I-387 A: this long without the server — while this phone itself is online — and the likely story
 *  is the host PC (asleep, lid shut, PartyBox closed): the banner says so, and where it is. */
export const ASLEEP_AFTER_MS = 20_000;

/** The line for a phone that has been cut off `forMs`; null while it's still a plain reconnect. */
export function asleepLine(forMs: number, online: boolean, since: string, address: string): string | null {
  if (forMs < ASLEEP_AFTER_MS || !online) return null;
  return strings.connection.pcAsleep(since, address);
}

/** I-387 A: the long line once the link has been gone 20 s (null before, and once it's back). */
export function useAsleepLine(trouble: boolean): string | null {
  const [lostAt, setLostAt] = useState<number | null>(null);
  useEffect(() => {
    if (!trouble) {
      const h = setTimeout(() => setLostAt(null), 0);
      return () => clearTimeout(h);
    }
    const at = Date.now();
    const h = setTimeout(() => setLostAt(at), ASLEEP_AFTER_MS);
    return () => clearTimeout(h);
  }, [trouble]);
  if (lostAt === null || typeof window === 'undefined') return null;
  const since = new Date(lostAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return asleepLine(ASLEEP_AFTER_MS, navigator.onLine !== false, since, window.location.host);
}

