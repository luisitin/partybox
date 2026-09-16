// Phone frame: header (room code, me, connection, VIP badge + menu), a countdown line during play
// (the TV timer is 3 m away), calm reconnect banner, toasts and the error strip. Everything below
// the header is the current screen. The shell also turns state transitions into the phone's own
// cues and haptics (docs/DESIGN_SYSTEM.md): the TV stays the audible focal point, so the phone
// only sounds for what happened in the player's hand (submit, error) and buzzes for the rest.
import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { PlayerPublic } from '@partybox/shared';
import {
  Avatar,
  DeadlineBar,
  buzz,
  hapticsEnabled,
  setHapticsEnabled,
  useSecondsLeft,
} from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import type { SoundEngine } from '../sound';
import { ThemePicker } from '../ThemePicker';
import pickerStyles from '../ThemePicker.module.css';
import styles from './ControllerShell.module.css';
import { VipMenu } from './VipMenu';

export interface ControllerShellProps {
  controller: Controller;
  state: ControllerState;
  me: PlayerPublic | null;
  /** The phone's sound engine; absent in /preview (silent). */
  audio?: SoundEngine;
  children: ReactNode;
}

/** "Something to press": what makes the last 5 s urgent on this screen (see `candidate`). */
const ACTIONABLE =
  'textarea:not(:disabled), input:not(:disabled), select:not(:disabled), ' +
  'button:not(:disabled):not([aria-disabled="true"]), [role="button"]:not([aria-disabled="true"])';

/** Haptic patterns (ms on/off) — docs/DESIGN_SYSTEM.md → Haptics. */
const BUZZ: Record<
  'submit' | 'error' | 'prompt' | 'winner' | 'results' | 'tick' | 'timeup',
  number | number[]
> = {
  submit: 20,
  error: [40, 60, 40],
  prompt: [30, 50, 30],
  winner: [60, 60, 60, 60, 160],
  results: 40,
  tick: 30,
  timeup: [60, 40, 60],
};

export function ControllerShell({
  controller,
  state,
  me,
  audio,
  children,
}: ControllerShellProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => !(audio?.muted() ?? true));
  const [haptics, setHaptics] = useState(() => hapticsEnabled());
  const room = state.room;
  const showBanner = state.connection !== 'connected' && state.joined;
  const view = room?.status === 'playing' ? state.view : null;
  const seconds = useSecondsLeft(view?.deadline ?? null, view?.paused ?? false);

  // Cues from state transitions, mirroring the TV's (TvApp). One `prev` snapshot per push.
  const myStatus = state.view?.players.find((p) => p.id === state.playerId)?.status ?? null;
  // The last 5 s of a real input phase for a player who has not answered: the phone (not the TV
  // 3 m away) is what they are staring at, so it is the phone that gets urgent. `data-urgent` on
  // the shell lets the SDK primitives (letters, the primary button) join in without a prop. A
  // game marks nobody 'submitted' in a passive phase (intro, reveal, scores), so the shell also
  // checks that the screen actually offers something to press — a WaitingScreen never panics.
  const timed = view !== null && view.timerMode !== 'quiet' && view.timerMode !== 'hidden';
  const acting = myStatus === 'active';
  const candidate =
    timed && !view.paused && seconds !== null && seconds >= 1 && seconds <= 5 && acting;
  const shellRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  // One haptic per second at 5…1, a soft tick at the 5 s edge, a thud at 0 for a phone that was
  // counting and still has not answered (Timer.tsx's `lastTicked` pattern, keyed per phase
  // instance; per-second is haptic-only so N phones never flam against the TV's countdown).
  const lastTicked = useRef<{ key: string; seconds: number } | null>(null);
  useEffect(() => {
    const canAct = timed && !view.paused && acting && !!mainRef.current?.querySelector(ACTIONABLE);
    shellRef.current?.toggleAttribute('data-urgent', candidate && canAct);
    if (!canAct || seconds === null || seconds > 5) return;
    const key = `${view.phaseId}:${view.deadline ?? ''}`;
    const last = lastTicked.current?.key === key ? lastTicked.current.seconds : null;
    if (last === seconds) return;
    lastTicked.current = { key, seconds };
    if (seconds === 0) {
      if (last === null) return;
      audio?.play('error');
      buzz(BUZZ.timeup);
      return;
    }
    if (seconds === 5) audio?.play('tick');
    buzz(BUZZ.tick);
  }, [timed, view, seconds, acting, candidate, audio]);

  const prev = useRef<{
    status: string | null;
    phase: string | null;
    roomStatus: string;
    error: boolean;
  }>({ status: null, phase: null, roomStatus: '', error: false });
  useEffect(() => {
    const p = prev.current;
    const roomStatus = room?.status ?? '';
    const phase = state.view?.phaseId ?? null;
    const error = state.error !== null;
    const playing = roomStatus === 'playing';
    // Locked in: the phone's own confirmation (a game that just cued its verdict wins the beat).
    if (playing && myStatus === 'submitted' && p.status !== 'submitted' && p.status !== null) {
      if (audio && performance.now() - audio.lastPlayedAt() > 50) audio.play('submit');
      buzz(BUZZ.submit);
    }
    // A rejected join or input: the strip goes red (Join renders the same error inline).
    if (error && !p.error) {
      audio?.play('error');
      buzz(BUZZ.error);
    }
    // The phone needs the player (a new prompt): a buzz only — the TV plays `phase`.
    if (
      playing &&
      phase !== null &&
      p.phase !== null &&
      phase !== p.phase &&
      myStatus === 'active' &&
      state.view?.timerMode !== 'quiet'
    )
      buzz(BUZZ.prompt);
    // Results: a longer pattern for a winner, one nudge for everyone else — the TV plays `win`.
    if (roomStatus === 'results' && p.roomStatus !== 'results' && p.roomStatus !== '') {
      const won =
        state.playerId !== null && room?.results?.results.winnerIds.includes(state.playerId);
      buzz(won ? BUZZ.winner : BUZZ.results);
    }
    prev.current = {
      status: playing ? myStatus : null,
      phase: playing ? phase : null,
      roomStatus,
      error,
    };
  }, [room, state.view, state.error, state.playerId, myStatus, audio]);

  const toggleSound = (): void => {
    if (!audio) return;
    const next = !soundOn;
    audio.setMuted(!next);
    setSoundOn(next);
    if (next) void audio.enable().then((ok) => ok && audio.play('submit'));
  };
  const toggleHaptics = (): void => {
    const next = !haptics;
    setHapticsEnabled(next);
    setHaptics(next);
    if (next) buzz(BUZZ.submit);
  };
  return (
    <div ref={shellRef} className={styles.shell} data-surface="controller">
      <header className={styles.header}>
        <div className={styles.left}>
          <span className={styles.brand} aria-label={t.appName}>
            <span className={styles.brandFull}>{t.appName}</span>
            <span className={styles.brandShort} aria-hidden>
              {t.appShort}
            </span>
          </span>
          {room ? (
            <span className={styles.code} aria-label={`${t.lobby.room} ${room.code}`}>
              {room.code}
            </span>
          ) : null}
        </div>
        <div className={styles.right}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setThemeOpen(true)}
            aria-haspopup="dialog"
            aria-label={t.theme.title}
          >
            🎨
          </button>
          <span
            className={`${styles.dot} ${state.connection === 'connected' ? styles.on : styles.off}`}
            role="status"
            aria-label={state.connection}
          />
          {me ? (
            <>
              {/* Offline, the badge may already be stale (the server hands the VIP over after 30 s):
                  hide it until the connection is back and the snapshot is fresh. */}
              {me.isVip && state.connection === 'connected' ? (
                <button
                  type="button"
                  className={styles.vipBadge}
                  onClick={() => setMenuOpen(true)}
                  aria-haspopup="dialog"
                >
                  ★ {t.vip.badge}
                </button>
              ) : null}
              <span className={styles.me}>
                <Avatar avatarId={me.avatarId} size={32} />
                <span className={styles.meName}>{me.name}</span>
              </span>
            </>
          ) : null}
        </div>
      </header>
      {view && seconds !== null && view.timerMode !== 'hidden' ? (
        // ADR-030: a quiet timer keeps the bar (a rhythm) but drops the digits and the urgency.
        <div
          className={`${styles.deadline} ${seconds <= 5 && !view.paused && view.timerMode !== 'quiet' ? styles.urgent : ''}`}
          role="timer"
          aria-label={view.paused ? t.tv.paused : t.connection.secondsLeft(seconds)}
        >
          <DeadlineBar deadline={view.deadline} phaseKey={view.phaseId} paused={view.paused} />
          {candidate ? (
            <span className={styles.cue} aria-hidden>
              {t.connection.pickNow}
            </span>
          ) : null}
          {view.timerMode !== 'quiet' || view.paused ? (
            <span className={styles.seconds}>
              {view.paused ? `⏸ ${t.tv.paused}` : t.connection.seconds(seconds)}
            </span>
          ) : null}
        </div>
      ) : null}
      {showBanner ? (
        <div className={styles.banner} role="status">
          {t.connection.reconnecting}
        </div>
      ) : null}
      {state.error && state.joined ? (
        <button type="button" className={styles.error} onClick={controller.dismissError}>
          {state.error.message}
        </button>
      ) : null}
      <main ref={mainRef} className={styles.main}>
        {children}
      </main>
      <div className={styles.toasts} aria-live="polite">
        {state.toasts.map((toast) => (
          // A status line, not a button: screen readers announce it once and it never masquerades
          // as an action (a "… is now the VIP" toast used to match button lookups for /VIP/).
          <div
            key={toast.id}
            role="status"
            className={`${styles.toast} ${styles[toast.kind]}`}
            onClick={() => controller.dismissToast(toast.id)}
          >
            {toast.text}
          </div>
        ))}
      </div>
      {menuOpen && room && me?.isVip ? (
        <VipMenu
          controller={controller}
          room={room}
          me={me}
          paused={view?.paused ?? false}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
      {themeOpen ? (
        <ThemePicker
          variant="sheet"
          onClose={() => setThemeOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={pickerStyles.toggle}
                aria-pressed={soundOn}
                onClick={toggleSound}
                disabled={!audio}
              >
                <span className={pickerStyles.toggleGlyph} aria-hidden>
                  {soundOn ? '🔊' : '🔇'}
                </span>
                {t.controller.phoneSound}
                <span className={pickerStyles.toggleState}>
                  {soundOn ? t.controller.on : t.controller.off}
                </span>
              </button>
              <button
                type="button"
                className={pickerStyles.toggle}
                aria-pressed={haptics}
                onClick={toggleHaptics}
              >
                <span className={pickerStyles.toggleGlyph} aria-hidden>
                  📳
                </span>
                {t.controller.vibration}
                <span className={pickerStyles.toggleState}>
                  {haptics ? t.controller.on : t.controller.off}
                </span>
              </button>
            </>
          }
        />
      ) : null}
    </div>
  );
}
