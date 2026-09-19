// The TV's two countdown rings: the intro's "first number in 3 · 2 · 1" (loop 262) and the
// 3 · 2 · 1 after the last card-style menu closes (loop 242). One tick per second on both.
import { useEffect } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  BigText,
  Stage,
  useHold,
  useSecondsLeft,
  useSoundApi,
} from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import {
  DEAL_BOUNCE_MS,
  DEAL_START_MS,
  DEAL_STEP_MS,
  RESUME_MS,
  dealDoneMs,
} from '../server/types';
import styles from './Tv.module.css';

/**
 * The intro's last three seconds (loop 262): "First number in 3 · 2 · 1", a small ring and one
 * tick per second — the cards are dealt on the phones in the first second or so, then the room
 * knows exactly when the first ball drops. Before that the slot says the cards are being dealt.
 */
export function IntroCountdown({
  deadline,
  cards,
  waitingOn,
  players,
}: {
  deadline: number | null;
  /** Cards per player: the TV plucks once per card on the phones' deal beats (loop 278). */
  cards: number;
  /** Who is still picking their cards (loop 344): the slot names them until the 3 · 2 · 1. */
  waitingOn: string[];
  /** Everyone with cards: a row of faces, each lighting up as its player taps Ready (loop 349). */
  players: ViewPlayer[];
}): JSX.Element {
  const left = useSecondsLeft(deadline, false, 50);
  const counting = left !== null && left <= 3 && left > 0;
  const sound = useSoundApi();
  useEffect(() => {
    if (counting) sound.play('tick');
  }, [counting, left, sound]);
  // Once the last card back has landed the caption stops saying "dealing" (loop 302).
  const dealt = useHold('deal', dealDoneMs(cards));
  // The deal, heard from the sofa: the same beats the phones use (Controller.tsx — a second a
  // card, loop 345; the pluck on the bounce), so the room's plucks and the TV's land together.
  useEffect(() => {
    const handles = Array.from({ length: cards }, (_, i) =>
      setTimeout(() => sound.play('card'), DEAL_START_MS + i * DEAL_STEP_MS + DEAL_BOUNCE_MS),
    );
    return () => handles.forEach((h) => clearTimeout(h));
  }, [cards, sound]);
  return (
    <div className={styles.introSlot}>
      {counting ? (
        <>
          <span className={styles.introLead}>first number in</span>
          {/* The ring pops in whole; only a CHANGE of digit pops the digit (loop 299: the
              first frame showed an empty ring while the digit's own pop was still invisible). */}
          <span className={`${styles.introRing} pb-tick`}>
            <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden>
              <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
              <circle
                className={styles.ringFill}
                cx="60"
                cy="60"
                r="52"
                style={{ animationDuration: '3000ms' }}
              />
            </svg>
            <BigText key={left} level="h1" tone="accent" className="pb-tick">
              {left}
            </BigText>
          </span>
        </>
      ) : (
        <>
          {/* The deal itself (loop 279): one card back per card, dealt out of a deck on the
              plucks' beats, each turning face-up as it lands in the fan. */}
          <span className={styles.dealWrap}>
            {dealt ? (
              // The faces take the fan's place once the deal is down (loop 349): dim while
              // picking, lit with a ✓ as each Ready lands — who the room waits for, at a glance.
              <span className={`${styles.dealFan} ${styles.readyRow}`} aria-hidden>
                {players
                  .filter((p) => p.status !== 'spectator')
                  .map((p) => (
                    <span
                      key={p.id}
                      className={`${styles.readyFace} ${p.status === 'submitted' ? `${styles.readyDone} pb-pop` : waitingOn.length === 1 ? styles.readyLast : ''}`}
                    >
                      <Avatar avatarId={p.avatarId} size="72px" />
                      <b className={styles.readyTick}>✓</b>
                    </span>
                  ))}
              </span>
            ) : (
              <span className={styles.dealFan} aria-hidden>
                {Array.from({ length: cards }, (_, i) => (
                  <span
                    key={i}
                    className={styles.dealSlot}
                    style={{ transform: `rotate(${(i - (cards - 1) / 2) * 9}deg)` }}
                  >
                    <span
                      className={styles.dealCard}
                      style={{ animationDelay: `${DEAL_START_MS + i * DEAL_STEP_MS}ms` }}
                    />
                  </span>
                ))}
              </span>
            )}
            <span className={styles.introLead}>
              {!dealt
                ? 'dealing the cards…'
                : waitingOn.length === 0
                  ? 'everyone is ready'
                  : waitingOn.length > 3
                    ? `pick your cards on your phone — ${waitingOn.length} still picking`
                    : `pick your cards on your phone — waiting for ${waitingOn.join(', ')}`}
            </span>
          </span>
        </>
      )}
    </div>
  );
}

/** The 3 · 2 · 1 after the last card-style menu closes: one tick per second, then the next number. */
export function Resume({
  roundLabel,
  resumeAt,
  pattern,
  by,
}: {
  roundLabel: string;
  resumeAt: number;
  /** The pattern in play — after "keep going — blackout" the room reads the new goal here. */
  pattern?: string;
  /** Who chose to keep going (loop 325): the 3 s screen says why the room is counting. */
  by?: string | null;
}): JSX.Element {
  const left = Math.min(3, useSecondsLeft(resumeAt, false, 50) ?? 0); // a 4 would tick four times on a 3 s hold
  const sound = useSoundApi();
  useEffect(() => {
    if (left > 0) sound.play('tick');
  }, [left, sound]);
  return (
    <Stage center>
      <p className={styles.kicker}>
        {roundLabel}
        {pattern ? ` · ${pattern}` : ''} · calling resumes in
      </p>
      <div className={styles.resumeWrap}>
        <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden>
          <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
          <circle
            key={resumeAt}
            className={styles.ringFill}
            cx="60"
            cy="60"
            r="52"
            style={{ animationDuration: `${RESUME_MS}ms` }}
          />
        </svg>
        {/* The ring and its 3 arrive together; a change of digit pops (loop 300). */}
        <BigText key={left} level="display" tone="accent" className="pb-tick">
          {Math.max(1, left)}
        </BigText>
      </div>
      <BigText level="h2" tone="muted">
        {by ? `${by} said keep going — thumbs ready` : 'get your thumbs ready'}
      </BigText>
    </Stage>
  );
}
