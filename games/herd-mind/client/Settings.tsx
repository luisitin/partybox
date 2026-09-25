// The in-game settings (the owner, 2026-09-24): a ⚙️ button on every phone screen opens this
// phone's own switches — music, sounds, vibration, motion. While anyone has it open the whole room
// waits (the server holds the clock); everyone else sees who, and may open theirs too. When the
// last one closes, 3 · 2 · 1 on every screen and the game carries on.
import { createContext, useContext, useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  buzz,
  hapticsEnabled,
  PrimaryButton,
  setHapticsEnabled,
  setMotionOff,
  useMotionOff,
  usePhonePrefs,
  useSecondsLeft,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './Settings.module.css';

/** How a screen opens the settings (null: not offered — a spectator, the end). */
export const OpenSettings = createContext<(() => void) | null>(null);

/** The ⚙️ button: each screen puts it in its top row; it opens the sheet via OpenSettings. */
export function SettingsPill(): JSX.Element | null {
  const L = useT(STRINGS);
  const onOpen = useContext(OpenSettings);
  if (!onOpen) return null;
  return (
    <button type="button" className={styles.pill} onClick={onOpen} aria-label={L('Settings')}>
      <span aria-hidden>⚙️</span>
    </button>
  );
}

function Row({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <button
      type="button"
      className={`${styles.row} ${on ? styles.rowOn : ''}`}
      aria-pressed={on}
      onClick={onToggle}
    >
      <span className={styles.rowText}>
        {label}
        <small>{hint}</small>
      </span>
      <span className={styles.switch} aria-hidden>
        <span className={styles.knob} />
      </span>
      <span className="pb-visually-hidden">{on ? L('on') : L('off')}</span>
    </button>
  );
}

export function SettingsSheet({ onClose }: { onClose: () => void }): JSX.Element {
  const L = useT(STRINGS);
  const prefs = usePhonePrefs();
  const motionOff = useMotionOff();
  const [haptics, setHaptics] = useState(() => hapticsEnabled());
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  return (
    <div className={styles.scrim}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={L('Settings')}>
        <h2 className={styles.title}>
          {L('Settings')} <small>{L('the game waits for you')}</small>
        </h2>
        {prefs.available ? (
          <>
            <Row
              label={L('Music')}
              hint={L('on this phone')}
              on={prefs.music.on}
              onToggle={() => prefs.music.set(!prefs.music.on)}
            />
            <Row
              label={L('Sounds')}
              hint={L('taps, the reader')}
              on={prefs.sound.on}
              onToggle={() => prefs.sound.set(!prefs.sound.on)}
            />
          </>
        ) : null}
        {canVibrate ? (
          <Row
            label={L('Vibration')}
            hint={L('a buzz when you tap')}
            on={haptics}
            onToggle={() => {
              setHapticsEnabled(!haptics);
              setHaptics(!haptics);
              if (!haptics) buzz(20);
            }}
          />
        ) : null}
        <Row
          label={L('Motion')}
          hint={L('cards fly, pens rise')}
          on={!motionOff}
          onToggle={() => setMotionOff(!motionOff)}
        />
        <p className={styles.note}>{L('Theme: the 🎨 in the top bar, any time.')}</p>
        <PrimaryButton onClick={onClose}>{L('Done')}</PrimaryButton>
      </div>
    </div>
  );
}

export function holdLine(names: string[], L: Translator): string {
  if (names.length === 1)
    return L('{name} is changing their settings. The game waits.', { name: names[0] ?? '' });
  return L('{count} people are changing their settings. The game waits.', { count: names.length });
}

/** Someone else has their settings open: the room waits, and you may open yours too. */
export function HoldCurtain({
  names,
  onOpen,
}: {
  names: string[];
  onOpen: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.scrim} role="status">
      <div className={styles.curtain}>
        <span className={styles.pauseGlyph} aria-hidden>
          ⏸
        </span>
        <p className={styles.curtainLine}>{holdLine(names, L)}</p>
        <PrimaryButton tone="neutral" onClick={onOpen}>
          {L('Change my settings too')}
        </PrimaryButton>
      </div>
    </div>
  );
}

/** 3 · 2 · 1 until `until` (server time), a ring draining over it; each digit ticks. */
export function Countdown({
  until,
  line,
  size = 'phone',
}: {
  until: number;
  line: string;
  size?: 'phone' | 'tv';
}): JSX.Element | null {
  const left = useSecondsLeft(until, false, 50);
  const play = useSound();
  const shown = left === null ? 0 : Math.min(3, left);
  useEffect(() => {
    if (shown > 0) play('tick');
  }, [shown, play]);
  if (left === null || left <= 0) return null;
  return (
    <div
      className={`${styles.scrim} ${size === 'tv' ? styles.tv : ''}`}
      role="status"
      aria-live="assertive"
    >
      <div className={styles.countWrap}>
        <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden>
          <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
          <circle key={until} className={styles.ringFill} cx="60" cy="60" r="52" />
        </svg>
        <div key={shown} className={styles.count}>
          {shown}
        </div>
      </div>
      <p className={styles.countLine}>{line}</p>
    </div>
  );
}
