// The Bingo phone's overlays: the card-style sheet (tap a style to see it behind the sheet, then
// Confirm or Keep changing), the curtain while someone else is changing (with a way into your own
// menu), the 3 · 2 · 1 before calling resumes, and the turn-your-phone gate.
import { useEffect } from 'react';
import type { JSX } from 'react';
import {
  PrimaryButton,
  buzz,
  setMotionOff,
  useHold,
  useMotionOff,
  useSecondsLeft,
  useSound,
} from '@partybox/game-sdk/ui';
import { RESUME_MS, dealDoneMs } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { STYLES, styleReason } from './styles';
import type { CardStyle, Orientation } from './styles';
import styles from './Controller.module.css';

export function StyleSheet({
  cards,
  current,
  preview,
  onPreview,
  onConfirm,
  onClose,
}: {
  cards: number;
  current: CardStyle;
  preview: CardStyle | null;
  onPreview: (id: CardStyle) => void;
  onConfirm: () => void;
  onClose: () => void;
}): JSX.Element {
  const motionOff = useMotionOff();
  // Previewing: the sheet folds to a bar so the whole screen shows the style with the real cards.
  if (preview)
    return (
      <div className={styles.previewBar} role="dialog" aria-label="Card style preview">
        <span>{STYLES.find((s) => s.id === preview)?.label}: like it?</span>
        <PrimaryButton tone="neutral" onClick={() => onPreview(current)}>
          Keep changing
        </PrimaryButton>
        <PrimaryButton onClick={onConfirm}>Confirm</PrimaryButton>
      </div>
    );
  return (
    <div className={styles.sheet} role="dialog" aria-label="Card style">
      <h4 className={styles.sheetTitle}>
        Card style <small>the room is paused</small>
      </h4>
      {STYLES.map((s) => {
        const why = styleReason(s, cards);
        const on = s.id === current;
        return (
          <button
            type="button"
            key={s.id}
            className={`${styles.row} ${on ? styles.rowOn : ''}`}
            disabled={why !== ''}
            onClick={() => onPreview(s.id)}
          >
            <span>
              {s.label} <small>· {s.hint}</small>
            </span>
            <small>
              {why || (s.orient === 'landscape' ? 'sideways' : 'upright')}
              {on ? ' ✓' : ''}
            </small>
          </button>
        );
      })}
      {/* Motion on / off (the owner, loop 311): off, a card comes up without the rise and every
          other animation on this phone collapses — for eyes that would rather not. Per device. */}
      <button
        type="button"
        className={`${styles.row} ${motionOff ? '' : styles.rowOn}`}
        onClick={() => setMotionOff(!motionOff)}
        aria-pressed={!motionOff}
      >
        <span>
          Motion <small>· cards rise, numbers pop</small>
        </span>
        <small>{motionOff ? 'off' : 'on ✓'}</small>
      </button>
      <p className={styles.sheetNote}>Theme: the 🎨 in the top bar, any time.</p>
      <PrimaryButton tone="neutral" onClick={onClose}>
        Close
      </PrimaryButton>
    </div>
  );
}

/** Someone else has their style menu open: the caller waits, and you may open yours too. */
export function HoldCurtain({
  names,
  onOpen,
}: {
  names: string[];
  onOpen: () => void;
}): JSX.Element {
  const who = names.length > 2 ? `${names[0]} and ${names.length - 1} others` : names.join(' and ');
  return (
    <div className={styles.curtain} role="status">
      <div>
        <p className={styles.curtainLine}>
          ⏸ {who} {names.length > 1 ? 'are' : 'is'} changing card style…
        </p>
        <PrimaryButton tone="neutral" onClick={onOpen}>
          Change my style too
        </PrimaryButton>
      </div>
    </div>
  );
}

/** The last menu closed: 3 · 2 · 1 on every screen, then the next number. */
export function Countdown({
  resumeAt,
  pattern,
  by,
}: {
  resumeAt: number;
  /** The pattern in play: after "keep going — blackout" the hand reads the new goal (loop 277). */
  pattern?: string;
  /** Who chose to keep going (loop 326) — "you", on their own phone. */
  by?: string | null;
}): JSX.Element | null {
  const left = useSecondsLeft(resumeAt, false, 50);
  const play = useSound();
  const shown = left === null ? 0 : Math.min(3, left); // a clock a hair behind would say 4 first
  // Each digit lands with a tick (the TV ticks too, at its own clock); the last one is the call.
  useEffect(() => {
    if (shown > 0) play('tick');
  }, [shown, play]);
  if (left === null || left <= 0) return null;
  return (
    <div className={styles.curtain} role="status" aria-live="assertive">
      <div className={styles.countWrap}>
        {/* A ring that drains over the three seconds: the thumb can see how long is left. */}
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
        {/* The curtain and its 3 arrive together; a change of digit pops (loop 300). */}
        <div key={shown} className={`${styles.count} pb-tick`}>
          {shown}
        </div>
      </div>
      <p className={styles.curtainLine}>
        {pattern ? `${pattern} · ` : ''}
        {by ? `${by} said keep going` : 'get your thumbs ready'}
      </p>
    </div>
  );
}

/**
 * The intro's last three seconds in the hand (loop 263): "first number in 3 · 2 · 1" with one
 * light tap per second — the TV ticks, the phones tap, one clock. Before that: the deal.
 */
export function IntroCount({
  deadline,
  cards,
  ready,
  waitingOn,
}: {
  deadline: number | null;
  /** Cards dealt: the caption says "dealing" only while the deal is on (loop 302). */
  cards: number;
  /** This phone tapped Ready; who has not yet (the card-pick step, loop 344). */
  ready: boolean;
  waitingOn: string[];
}): JSX.Element {
  const left = useSecondsLeft(deadline, false, 50);
  const shown = left !== null && left <= 3 && left > 0 ? left : 0;
  useEffect(() => {
    if (shown > 0) buzz(15);
  }, [shown]);
  // Once the last card is down the caption stops saying "dealing" (loop 302; a second a card, 345).
  const dealt = useHold('deal', dealDoneMs(cards));
  return (
    <p className={styles.introCount} aria-live="polite">
      {shown > 0 ? (
        <>
          first number in{' '}
          <b key={shown} className="pb-tick">
            {shown}
          </b>
        </>
      ) : dealt ? (
        ready ? (
          waitingOn.length > 0 ? (
            `ready — waiting for ${waitingOn.length > 2 ? `${waitingOn.length} more` : waitingOn.join(' and ')}`
          ) : (
            'everyone is ready'
          )
        ) : cards > 1 ? (
          'swap a card, or tap Ready'
        ) : (
          'swap it, or tap Ready'
        )
      ) : (
        'dealing the cards…'
      )}
    </p>
  );
}

/** Wrong way up for the chosen style: a little phone turns the way it should go. */
export function TurnGate({ to, style }: { to: Orientation; style: string }): JSX.Element {
  return (
    <div className={styles.turn} role="status">
      <span
        className={`${styles.turnPhone} ${to === 'landscape' ? styles.turnToLandscape : styles.turnToPortrait}`}
        aria-hidden
      />
      <p className={styles.turnLine}>
        Turn your phone {to === 'landscape' ? 'sideways' : 'upright'} for {style}.
      </p>
      <p className={styles.hint}>the cards appear the moment you do</p>
    </div>
  );
}

/** The reconnect notice (review-loop #4): the TV board has what you missed. */
export function MissedToast({
  view,
  count,
}: {
  view: BingoControllerView;
  count: number;
}): JSX.Element | null {
  if (!view.showBoard) return null;
  return (
    <p className={styles.missedToast} role="status">
      {count === 1
        ? 'Back — you missed a number. It is on the TV board.'
        : `Back — you missed ${count} numbers. They are on the TV board.`}
    </p>
  );
}
