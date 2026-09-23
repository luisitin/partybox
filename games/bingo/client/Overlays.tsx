// The Bingo phone's overlays: the card-style sheet (tap a style to see it behind the sheet, then
// Confirm or Keep changing), the curtain while someone else is changing (with a way into your own
// menu), the 3 · 2 · 1 before calling resumes (the turn gate and the reconnect toast: Notices.tsx).
import { useEffect } from 'react';
import type { JSX } from 'react';
import {
  PrimaryButton,
  setMotionOff,
  useMotionOff,
  useSecondsLeft,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import { RESUME_MS } from '../server/types';
import { StyleMini } from './StyleMini';
import { STYLES, styleReason } from './styles';
import { DaubRows } from './DaubRows';
import { holdLine } from './copy';
import { STRINGS } from './strings';
import type { CardStyle } from './styles';
import { styleWords } from './words';
import styles from './Controller.module.css';

export function StyleSheet({
  cards,
  current,
  preview,
  onPreview,
  onConfirm,
  onClose,
  note,
  tablet,
  onBack,
}: {
  cards: number;
  current: CardStyle;
  preview: CardStyle | null;
  onPreview: (id: CardStyle) => void;
  onConfirm: () => void;
  onClose: () => void;
  /** What the sheet costs the room: a hold in play, nothing on the card-pick step. */
  note?: string;
  /** I-126 A: on a tablet, the all-cards layout is a choice too (its default). */
  tablet?: { on: boolean; onPick: () => void };
  /** I-126 A: "Keep changing" — back to the list (it previewed the phone's style on a tablet). */
  onBack?: () => void;
}): JSX.Element {
  const motionOff = useMotionOff();
  const L = useT(STRINGS);
  const words = styleWords(L);
  // Previewing: the sheet folds to a bar so the whole screen shows the style with the real cards.
  if (preview)
    return (
      <div
        className={`${styles.previewBar} ${styles.previewSlim}`}
        role="dialog"
        aria-label={L('Card style preview')}
      >
        {/* I-407 A: one slim row — the previewed cards stay in view */}
        <span className={styles.previewLabel}>
          <StyleMini id={preview} />
          {L('{style}?', { style: words[preview].label })}
        </span>
        <PrimaryButton tone="neutral" onClick={() => (onBack ? onBack() : onPreview(current))}>
          {L('Change')}
        </PrimaryButton>
        <PrimaryButton onClick={onConfirm}>{L('Confirm')}</PrimaryButton>
      </div>
    );
  return (
    <div className={styles.sheet} role="dialog" aria-label={L('Card style')}>
      <h4 className={styles.sheetTitle}>
        {L('Card style')} <small>{note ?? L('the room is paused')}</small>
      </h4>
      {tablet ? (
        <button
          type="button"
          className={`${styles.row} ${tablet.on ? styles.rowOn : ''}`}
          onClick={tablet.onPick}
        >
          <span className={styles.rowText}>
            {L('All cards')} <small className={styles.rowHint}>{L('· the tablet layout')}</small>
          </span>
          <span className={styles.rowRight}>
            <small>{tablet.on ? L('on ✓') : L('tablet')}</small>
          </span>
        </button>
      ) : null}
      {STYLES.map((s) => {
        const why = styleReason(s, cards, L);
        const on = s.id === current && !tablet?.on;
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
              {words[s.id].label} <small className={styles.rowHint}>· {words[s.id].hint}</small>
            </span>
            <span className={styles.rowRight}>
              <small>
                {why || (s.orient === 'landscape' ? L('sideways') : L('upright'))}
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
          {L('Motion')} <small className={styles.rowHint}>· {L('cards rise, numbers pop')}</small>
        </span>
        <span className={styles.rowRight}>
          <small>{motionOff ? L('off') : L('on ✓')}</small>
          <StyleMini id="motion" live={!motionOff} />
        </span>
      </button>

      <DaubRows />
      <p className={styles.sheetNote}>{L('Theme: the 🎨 in the top bar, any time.')}</p>
      <PrimaryButton tone="neutral" onClick={onClose}>
        {L('Close')}
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
  const L = useT(STRINGS);
  return (
    <div className={styles.curtain} role="status">
      <div>
        <p className={styles.curtainLine}>{holdLine(names, L)}</p>
        <PrimaryButton tone="neutral" onClick={onOpen}>
          {L('Change my style too')}
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
  mine = false,
}: {
  resumeAt: number;
  /** The pattern in play: after "keep going — blackout" the hand reads the new goal (loop 277). */
  pattern?: string;
  /** Who chose to keep going (loop 326)… */
  by?: string | null;
  /** …or this phone did: "you said keep going". */
  mine?: boolean;
}): JSX.Element | null {
  const left = useSecondsLeft(resumeAt, false, 50);
  const play = useSound();
  const L = useT(STRINGS);
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
        {mine
          ? L('you said keep going')
          : by
            ? L('{name} said keep going', { name: by })
            : L('get your thumbs ready')}
      </p>
    </div>
  );
}
