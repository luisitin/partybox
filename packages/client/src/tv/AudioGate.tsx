// Browser autoplay policy: sound needs a gesture. Instead of a full-screen gate (which hid the QR
// after every load and left an unattended TV stuck), the stage renders normally with a small
// "tap for sound" pill; the first click/key anywhere enables audio and plays `ready` — the one
// moment the TV can prove its speakers work — while the pill fades out. Theme, mute (persisted)
// and fullscreen sit in the corner inside the overscan margin; the speaker glyph shows 🔇 until
// audio is really on (started AND unmuted), never a 🔊 that contradicts the pill.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { BedEngine } from '../beds';
import type { MusicEngine } from '../music';
import type { SoundEngine } from '../sound';
import { ThemePicker } from '../ThemePicker';
import styles from './AudioGate.module.css';

export interface AudioGateProps {
  audio: SoundEngine;
  /** The stage's background music: starts on the gate tap, follows the mute toggle. */
  music?: MusicEngine;
  /** The synthesized beds (ADR-032): same gate, same mute. */
  beds?: BedEngine;
  /** I-069 A: a manual mute/unmute happened (true = now muted) — the shell raises a toast. */
  onToggle?: (muted: boolean) => void;
}

export function AudioGate({ audio, music, beds, onToggle }: AudioGateProps): JSX.Element {
  const [started, setStarted] = useState(false);
  const [pillGone, setPillGone] = useState(false);
  const [muted, setMuted] = useState(audio.muted());
  const [themes, setThemes] = useState(false);
  const [pop, setPop] = useState(false);
  const readyPlayed = useRef(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (started) return;
    const start = (): void => {
      // Every engine wakes inside the gesture itself: Safari refuses an AudioContext created or
      // resumed after an await, so the music beds started only on Chrome (the owner heard no
      // music on Blanks, review-loop #151). The cue engine's own enable already ran in-gesture.
      music?.enable();
      void beds?.enable();
      void audio.enable().then((ok) => {
        if (!ok) return;
        setStarted(true);
        if (!readyPlayed.current) {
          readyPlayed.current = true;
          audio.play('ready'); // silent when the persisted mute is on
        }
      });
    };
    document.addEventListener('pointerdown', start);
    document.addEventListener('keydown', start);
    return () => {
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('keydown', start);
    };
  }, [audio, music, beds, started]);
  // The pill fades out on start; under reduced motion (0 ms) it leaves at once. A 400 ms fallback
  // covers a browser that never fires animationend.
  useEffect(() => {
    if (!started || pillGone) return;
    const handle = setTimeout(() => setPillGone(true), 400);
    return () => clearTimeout(handle);
  }, [started, pillGone]);
  const showPill = !pillGone && !(started && reduced);
  // The theme menu closes on a pointerdown outside the corner controls (the 🎨 button still
  // toggles it) and on Escape, which hands focus back to the 🎨 button.
  useEffect(() => {
    if (!themes) return;
    const onPointerDown = (e: PointerEvent): void => {
      if (controlsRef.current?.contains(e.target as Node)) return;
      setThemes(false);
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      setThemes(false);
      themeButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [themes]);
  const toggleMute = (): void => {
    // Before the gate the document listener has just enabled audio from this same pointerdown;
    // the click only ever toggles the persisted mute once sound is really on.
    if (!started) return;
    const next = !muted;
    audio.setMuted(next);
    music?.setMuted(next);
    beds?.setMuted(next);
    setMuted(next);
    setPop(true);
    if (!next) audio.play('ready');
    // I-069 A: the stage says so — a corner toast from the TV's own list.
    onToggle?.(next);
  };
  const fullscreen = (): void => {
    void document.documentElement.requestFullscreen?.();
  };
  const soundOn = started && !muted;
  return (
    <>
      {showPill ? (
        <button
          type="button"
          className={`${styles.pill} ${started ? styles.pillLeaving : ''}`}
          onAnimationEnd={() => started && setPillGone(true)}
          tabIndex={started ? -1 : 0}
        >
          {started ? (
            <>
              <span aria-hidden>🔊</span> {t.tv.soundOn}
            </>
          ) : (
            <>
              <span aria-hidden>🔇</span> {t.tv.tapToStart}
              <span className={styles.pillHint}>{t.tv.tapHint}</span>
            </>
          )}
        </button>
      ) : null}
      <div className={styles.controls} ref={controlsRef}>
        {themes ? (
          <div className={styles.themes}>
            <ThemePicker variant="menu" onClose={() => setThemes(false)} />
          </div>
        ) : null}
        <button
          type="button"
          ref={themeButtonRef}
          className={styles.control}
          onClick={() => setThemes((open) => !open)}
          aria-expanded={themes}
          aria-label={t.theme.title}
        >
          🎨
        </button>
        <button
          type="button"
          className={`${styles.control} ${pop ? styles.controlPop : ''}`}
          onClick={toggleMute}
          onAnimationEnd={() => setPop(false)}
          aria-pressed={started ? muted : undefined}
          aria-label={!started ? t.tv.enableSound : muted ? t.tv.unmute : t.tv.mute}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          type="button"
          className={styles.control}
          onClick={fullscreen}
          aria-label={t.tv.fullscreen}
        >
          ⛶
        </button>
      </div>
    </>
  );
}
