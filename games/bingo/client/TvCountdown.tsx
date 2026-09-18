// The TV's two countdown rings: the intro's "first number in 3 · 2 · 1" (loop 262) and the
// 3 · 2 · 1 after the last card-style menu closes (loop 242). One tick per second on both.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { BigText, Stage, useSecondsLeft, useSoundApi } from '@partybox/game-sdk/ui';
import { RESUME_MS } from '../server/types';
import styles from './Tv.module.css';

/**
 * The intro's last three seconds (loop 262): "First number in 3 · 2 · 1", a small ring and one
 * tick per second — the cards are dealt on the phones in the first second or so, then the room
 * knows exactly when the first ball drops. Before that the slot says the cards are being dealt.
 */
export function IntroCountdown({
  deadline,
  cards,
}: {
  deadline: number | null;
  /** Cards per player: the TV plucks once per card on the phones' deal beats (loop 278). */
  cards: number;
}): JSX.Element {
  const left = useSecondsLeft(deadline);
  const counting = left !== null && left <= 3 && left > 0;
  const sound = useSoundApi();
  useEffect(() => {
    if (counting) sound.play('tick');
  }, [counting, left, sound]);
  // The deal, heard from the sofa: the same 360 + i × 110 (+250 on the bounce) the phones use
  // (Controller.tsx), so the room's plucks and the TV's land together.
  useEffect(() => {
    const handles = Array.from({ length: cards }, (_, i) =>
      setTimeout(() => sound.play('card'), 360 + i * 110 + 250),
    );
    return () => handles.forEach((h) => clearTimeout(h));
  }, [cards, sound]);
  return (
    <div className={styles.introSlot}>
      {counting ? (
        <>
          <span className={styles.introLead}>first number in</span>
          <span className={styles.introRing}>
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
            <BigText key={left} level="h1" tone="accent" className="pb-pop">
              {left}
            </BigText>
          </span>
        </>
      ) : (
        <>
          {/* The deal itself (loop 279): one card back per card, dealt out of a deck on the
              plucks' beats, each turning face-up as it lands in the fan. */}
          <span className={styles.dealWrap}>
            <span className={styles.dealFan} aria-hidden>
              {Array.from({ length: cards }, (_, i) => (
                <span
                  key={i}
                  className={styles.dealSlot}
                  style={{ transform: `rotate(${(i - (cards - 1) / 2) * 9}deg)` }}
                >
                  <span
                    className={styles.dealCard}
                    style={{ animationDelay: `${360 + i * 110}ms` }}
                  />
                </span>
              ))}
            </span>
            <span className={styles.introLead}>dealing the cards…</span>
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
}: {
  roundLabel: string;
  resumeAt: number;
  /** The pattern in play — after "keep going — blackout" the room reads the new goal here. */
  pattern?: string;
}): JSX.Element {
  const left = Math.min(3, useSecondsLeft(resumeAt) ?? 0); // a 4 would tick four times on a 3 s hold
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
        <BigText key={left} level="display" tone="accent" className="pb-pop">
          {Math.max(1, left)}
        </BigText>
      </div>
      <BigText level="h2" tone="muted">
        get your thumbs ready
      </BigText>
    </Stage>
  );
}
