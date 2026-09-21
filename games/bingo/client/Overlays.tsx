// The Bingo phone's overlays: the card-style sheet (tap a style to see it behind the sheet, then
// Confirm or Keep changing), the curtain while someone else is changing (with a way into your own
// menu), the 3 · 2 · 1 before calling resumes (the turn gate and the reconnect toast: Notices.tsx).
import { useEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import {
  PrimaryButton,
  buzz,
  setMotionOff,
  useHold,
  useMotionOff,
  useSecondsLeft,
  useSound,
} from '@partybox/game-sdk/ui';
import type { PlayCue } from '@partybox/game-sdk/ui';
import { RESUME_MS, dealDoneMs } from '../server/types';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { StyleMini } from './StyleMini';
import { DAUBS, INKS, STYLES, setDaubStyle, setInk, styleReason, useDaubStyle, useInk } from './styles';
import type { CardStyle } from './styles';
import styles from './Controller.module.css';

export function StyleSheet({
  cards,
  current,
  preview,
  onPreview,
  onConfirm,
  onClose,
  note = 'the room is paused',
}: {
  cards: number;
  current: CardStyle;
  preview: CardStyle | null;
  onPreview: (id: CardStyle) => void;
  onConfirm: () => void;
  onClose: () => void;
  /** What the sheet costs the room: a hold in play, nothing on the card-pick step. */
  note?: string;
}): JSX.Element {
  const motionOff = useMotionOff();
  const daub = useDaubStyle();
  const ink = useInk();
  // Previewing: the sheet folds to a bar so the whole screen shows the style with the real cards.
  if (preview)
    return (
      <div className={styles.previewBar} role="dialog" aria-label="Card style preview">
        <span className={styles.previewLabel}>
          {/* I-013 C: the picked shape, big, pops in beside the question. */}
          <StyleMini id={preview} big />
          {STYLES.find((s) => s.id === preview)?.label}: like it?
        </span>
        <PrimaryButton tone="neutral" onClick={() => onPreview(current)}>
          Keep changing
        </PrimaryButton>
        <PrimaryButton onClick={onConfirm}>Confirm</PrimaryButton>
      </div>
    );
  return (
    <div className={styles.sheet} role="dialog" aria-label="Card style">
      <h4 className={styles.sheetTitle}>
        Card style <small>{note}</small>
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
            {/* One line per row (the owner's note): the text ellipsizes before the diagram
                wraps; under 360 px the hint goes. */}
            <span className={styles.rowText}>
              {s.label} <small className={styles.rowHint}>· {s.hint}</small>
            </span>
            <span className={styles.rowRight}>
              <small>
                {why || (s.orient === 'landscape' ? 'sideways' : 'upright')}
                {on ? ' ✓' : ''}
              </small>
              <StyleMini id={s.id} off={why !== ''} live={on && !motionOff} />
            </span>
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
        <span className={styles.rowText}>
          Motion <small className={styles.rowHint}>· cards rise, numbers pop</small>
        </span>
        <span className={styles.rowRight}>
          <small>{motionOff ? 'off' : 'on ✓'}</small>
          <StyleMini id="motion" live={!motionOff} />
        </span>
      </button>

      {/* S-002 A: the daub's look — Blot, Stamp or Ring — per phone, applied at once. */}
      <p className={styles.sheetGroup}>Daub</p>
      <div className={styles.choiceRow} role="radiogroup" aria-label="Daub">
        {DAUBS.map((d) => (
          <button
            type="button"
            key={d.id}
            role="radio"
            aria-checked={daub === d.id}
            className={`${styles.choice} ${daub === d.id ? styles.choiceOn : ''}`}
            onClick={() => setDaubStyle(d.id)}
          >
            <span className={styles.choiceCell} data-daub={d.id} aria-hidden>
              <i>27</i>
            </span>
            {d.label}
          </button>
        ))}
      </div>
      {/* S-002 B: the ink. */}
      <p className={styles.sheetGroup}>Ink</p>
      <div className={styles.choiceRow} role="radiogroup" aria-label="Ink">
        {INKS.map((i) => (
          <button
            type="button"
            key={i.id}
            role="radio"
            aria-checked={ink === i.id}
            className={`${styles.choice} ${ink === i.id ? styles.choiceOn : ''}`}
            onClick={() => setInk(i.id)}
            style={i.css ? ({ '--pb-swatch': i.css } as CSSProperties) : undefined}
          >
            <span className={`${styles.swatch} ${i.css ? '' : styles.swatchMine}`} aria-hidden />
            {i.label}
          </button>
        ))}
      </div>
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
  lastOne,
}: {
  deadline: number | null;
  /** Cards dealt: the caption says "dealing" only while the deal is on (loop 302). */
  cards: number;
  /** This phone tapped Ready; who has not yet (the card-pick step, loop 344). */
  ready: boolean;
  waitingOn: string[];
  /** Everyone else is ready: one nudge buzz and the caption says so (loop 351). */
  lastOne: boolean;
}): JSX.Element {
  const left = useSecondsLeft(deadline, false, 50);
  const shown = left !== null && left <= 3 && left > 0 ? left : 0;
  useEffect(() => {
    if (shown > 0) buzz(15);
  }, [shown]);
  // Once the last card is down the caption stops saying "dealing" (loop 302; a second a card, 345).
  const dealt = useHold('deal', dealDoneMs(cards));
  useEffect(() => {
    if (lastOne) buzz([30, 50, 30]); // the shell's "needs you" pattern, once
  }, [lastOne]);
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
        ) : lastOne ? (
          'everyone is waiting for you'
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

/**
 * The card-pick step's two buttons (loop 344): "🎲 Another · card N" and Ready. They rise in once
 * the last card has landed (loop 368) — before that the footer stood bare under an empty table,
 * and Ready could be tapped before a card was even seen.
 */
export function IntroActions({
  view,
  cards,
  pick,
  canSwap,
  send,
  play,
  onSwap,
}: {
  view: BingoControllerView;
  cards: number;
  pick: number;
  canSwap: boolean;
  send: (input: Input) => void;
  play: PlayCue;
  onSwap: () => void;
}): JSX.Element {
  const dealt = useHold('deal', dealDoneMs(cards));
  return (
    <div className={`${styles.introActions} ${dealt ? styles.introActionsIn : ''}`}>
      <PrimaryButton
        tone="neutral"
        disabled={!canSwap || !dealt}
        onClick={() => {
          // The old card flips away and the new one flips in (loop 268): the flip is the card's
          // key; the pluck lands as the new face turns to the eye (~200 ms in).
          send({ type: 'swap', card: pick });
          onSwap();
          buzz(20);
          setTimeout(() => play('card'), 200);
        }}
      >
        🎲 {canSwap ? 'Another' : view.ready ? 'Picked' : 'Swapped'}
        {cards > 1 ? ` · card ${pick + 1}` : ''}
      </PrimaryButton>
      <PrimaryButton
        tone={view.ready ? 'success' : 'accent'}
        disabled={view.ready || !dealt}
        className={view.lastOne ? styles.nudge : undefined}
        onClick={() => {
          buzz(20);
          play('submit');
          send({ type: 'ready' });
        }}
      >
        {view.ready ? '✓ Ready' : 'Ready'}
      </PrimaryButton>
    </div>
  );
}
