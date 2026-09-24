// I-791 D (design review D): offline is a state you can see, and coming back is one clean step.
//
// Offline, the phone dims the game, makes it untappable and puts one calm card in the middle: what
// happened, that the seat is held and for how long (the server's grace, I-089 C), and whether the
// last answer got through. When the link holds again, a one-beat "You're back" card names where the
// game is now (the question, the seconds left, your place) and then the live screen shows — with no
// ghost of the old one fading over it (the shell hides every dissolve while this card is up).
//
// The flap rule (the owner, 2026-09-22) still holds: SHOW_AFTER_MS of trouble before anything is
// painted, and a drop inside the STABLE_MS window after a return never changes the card.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { ControllerView, PushedView } from '@partybox/shared';
import { t } from '../i18n';
import styles from './OfflineCard.module.css';

const SHOW_AFTER_MS = 1200;
/** How long the link must hold before the card may say "You're back". */
const STABLE_MS = 600;
/** How long "You're back" stays up — one beat, then the live screen. */
const BACK_MS = 1100;

export type LinkCard = 'off' | 'offline' | 'back';

/** Where the game stood when the link went (the last view this phone saw). */
export interface LinkSnapshot {
  phaseId: string | null;
  step: ControllerView['progressStep'] | null;
  myStatus: string | null;
}

export function snapshotOf(
  view: PushedView<ControllerView> | null,
  myStatus: string | null,
): LinkSnapshot {
  return { phaseId: view?.phaseId ?? null, step: view?.progressStep ?? null, myStatus };
}

/** The card's state across a flapping link, and the snapshot taken as it went offline. */
export function useLinkCard(
  trouble: boolean,
  live: LinkSnapshot,
): { card: LinkCard; before: LinkSnapshot | null } {
  const [state, setState] = useState<{ card: LinkCard; before: LinkSnapshot | null }>({
    card: 'off',
    before: null,
  });
  // The last snapshot seen while the link was fine (updated after render, read by the timers).
  const latest = useRef(live);
  useEffect(() => {
    if (!trouble) latest.current = live;
  });
  const { card } = state;
  useEffect(() => {
    const next: LinkCard | null =
      trouble && card !== 'offline'
        ? 'offline'
        : !trouble && card === 'offline'
          ? 'back'
          : !trouble && card === 'back'
            ? 'off'
            : null;
    if (next === null) return undefined;
    const wait =
      next === 'offline'
        ? card === 'off'
          ? SHOW_AFTER_MS
          : 0
        : next === 'back'
          ? STABLE_MS
          : BACK_MS;
    const h = setTimeout(
      () =>
        setState((s) => ({
          card: next,
          before: next === 'offline' && card === 'off' ? latest.current : s.before,
        })),
      wait,
    );
    return () => clearTimeout(h);
  }, [trouble, card]);
  return state;
}

const mmss = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Offline: the dimmed game's one card. */
export function OfflineCard({
  secondsLeft,
  before,
  playing,
}: {
  secondsLeft: number | null;
  before: LinkSnapshot | null;
  playing: boolean;
}): JSX.Element {
  const o = t.offline;
  const answer =
    !playing || !before
      ? null
      : before.myStatus === 'submitted'
        ? { text: o.sent, sent: true }
        : before.myStatus === 'active'
          ? { text: o.notSent, sent: false }
          : null;
  return (
    <div className={styles.veil} data-offline-card>
      <div className={styles.card} role="status" aria-live="polite">
        <span className={styles.spin} aria-hidden />
        <strong className={styles.title}>{o.title}</strong>
        <p className={styles.body}>
          {o.lost}{' '}
          {secondsLeft === null ? (
            o.heldPlain
          ) : (
            <>
              {o.heldFor} <b className={styles.time}>{mmss(secondsLeft)}</b>.
            </>
          )}
        </p>
        {answer ? (
          <span className={`${styles.pill} ${answer.sent ? styles.sent : ''}`}>{answer.text}</span>
        ) : null}
      </div>
    </div>
  );
}

/** Back online, for one beat: where the game is now. */
export function BackCard({
  before,
  view,
  seconds,
  playerId,
}: {
  before: LinkSnapshot | null;
  view: PushedView<ControllerView> | null;
  seconds: number | null;
  playerId: string | null;
}): JSX.Element {
  const o = t.offline;
  const now = view?.progressStep ?? null;
  const was = before?.step ?? null;
  const lines: string[] = [];
  if (view) {
    if (now && was && now.unit === was.unit && now.n > was.n) {
      // The question the phone dropped on counts as missed unless its answer was already in.
      const from = was.n + (before?.myStatus === 'submitted' ? 1 : 0);
      if (from < now.n) lines.push(o.missed(now.unit, from, now.n - 1));
    } else if (before?.phaseId && before.phaseId !== view.phaseId && !now) {
      lines.push(o.movedOn);
    } else if (before?.phaseId === view.phaseId && (!now || !was || now.n === was.n)) {
      lines.push(o.nothingMissed);
    }
    const timed = seconds !== null && view.timerMode !== 'hidden' && view.timerMode !== 'quiet';
    if (now) lines.push(o.where(now.unit, now.n, now.of, timed ? seconds : null));
    else if (timed) lines.push(o.secondsLeft(seconds));
  }
  const scored = view?.players.some((p) => typeof p.score === 'number') ?? false;
  const mine = view?.players.find((p) => p.id === playerId);
  const standing =
    scored && mine && typeof mine.score === 'number'
      ? o.standing(
          1 + (view?.players.filter((p) => (p.score ?? 0) > (mine.score ?? 0)).length ?? 0),
          mine.score,
        )
      : null;
  return (
    <div className={styles.back} role="status" data-back-card>
      <span className={styles.check} aria-hidden>
        ✓
      </span>
      <strong className={styles.backTitle}>{o.back}</strong>
      {lines.length > 0 ? (
        <p className={styles.body}>
          {lines.map((line, i) => (
            <span key={i} className={styles.line}>
              {line}
            </span>
          ))}
        </p>
      ) : null}
      {standing ? <span className={styles.standing}>{standing}</span> : null}
    </div>
  );
}
