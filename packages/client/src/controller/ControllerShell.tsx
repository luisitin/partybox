// Phone frame: header (room code, me, connection, VIP badge + menu), a countdown line during play
// (the TV timer is 3 m away), calm reconnect banner, toasts and the error strip. Everything below
// the header is the current screen. The shell also turns state transitions into the phone's own
// cues and haptics (docs/DESIGN_SYSTEM.md): the TV stays the audible focal point, so the phone
// only sounds for what happened in the player's hand (submit, error) and buzzes for the rest.
import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { PlayerPublic } from '@partybox/shared';
import { Avatar, DeadlineBar, buzz, useSecondsLeft } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import type { SoundEngine } from '../sound';
import { ThemePicker } from '../ThemePicker';
import styles from './ControllerShell.module.css';
import { PhoneSettings } from './PhoneSettings';
import { usePhoneUrgency } from './urgency';
import { VipMenu } from './VipMenu';

export interface ControllerShellProps {
  controller: Controller;
  state: ControllerState;
  me: PlayerPublic | null;
  /** The phone's sound engine; absent in /preview (silent). */
  audio?: SoundEngine;
  children: ReactNode;
}

/** Haptic patterns (ms on/off) — docs/DESIGN_SYSTEM.md → Haptics. */
const BUZZ: Record<'submit' | 'error' | 'prompt' | 'winner' | 'results', number | number[]> = {
  submit: 20,
  error: [40, 60, 40],
  prompt: [30, 50, 30],
  winner: [60, 60, 60, 60, 160],
  results: 40,
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
  const room = state.room;
  const showBanner = state.connection !== 'connected' && state.joined;
  // A pause freezes the phone too: the screen dims and goes inert (no taps, no focus, out of the
  // a11y tree — the server would drop the input anyway), and a banner says who resumes it. The
  // reconnect banner wins when both apply.
  const paused = room?.status === 'playing' && (state.view?.paused ?? false);
  // The in-game error strip shakes once per new error object ("adjust state when a prop changes";
  // Join owns the un-joined case). The cue + buzz for it live in the transition effect below.
  const [stripShaking, setStripShaking] = useState(false);
  const [seenError, setSeenError] = useState(state.error);
  if (state.error !== seenError) {
    setSeenError(state.error);
    if (state.error && state.joined) setStripShaking(true);
  }
  useEffect(() => {
    if (!stripShaking) return;
    const fallback = setTimeout(() => setStripShaking(false), 400);
    return () => clearTimeout(fallback);
  }, [stripShaking]);
  const vipName = room?.players.find((p) => p.isVip)?.name ?? t.vip.badge;
  const view = room?.status === 'playing' ? state.view : null;
  const seconds = useSecondsLeft(view?.deadline ?? null, view?.paused ?? false);

  // Cues from state transitions, mirroring the TV's (TvApp). One `prev` snapshot per push.
  const myStatus = state.view?.players.find((p) => p.id === state.playerId)?.status ?? null;
  // Offline, the local countdown still runs (and parks at 0): show it muted, never urgent.
  const online = state.connection === 'connected';
  // With a countdown row on screen, "Reconnecting…" takes its cue slot (review-loop #33): the
  // overlay banner hid the first content line for the whole outage. No row → the banner.
  const countdownRow = view !== null && seconds !== null && view.timerMode !== 'hidden';
  const { candidate, shellRef, mainRef } = usePhoneUrgency({
    view,
    seconds,
    myStatus,
    audio,
    online,
  });

  const prev = useRef<{
    status: string | null;
    phase: string | null;
    roomStatus: string;
    error: ControllerState['error'];
  }>({ status: null, phase: null, roomStatus: '', error: null });
  useEffect(() => {
    const p = prev.current;
    const roomStatus = room?.status ?? '';
    const phase = state.view?.phaseId ?? null;
    const error = state.error;
    const playing = roomStatus === 'playing';
    // Locked in: the phone's own confirmation (a game that just cued its verdict wins the beat).
    if (playing && myStatus === 'submitted' && p.status !== 'submitted' && p.status !== null) {
      if (audio && performance.now() - audio.lastPlayedAt() > 50) audio.play('submit');
      buzz(BUZZ.submit);
    }
    // A rejected join or input, once per error object: the strip goes red (Join renders the
    // same error inline).
    if (error && error !== p.error) {
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
              {/* The avatar opens the theme / phone-settings sheet too: on a 320 px phone the 🎨
                  button is hidden so the room code is not clipped (review-loop #7). */}
              <button
                type="button"
                className={styles.me}
                onClick={() => setThemeOpen(true)}
                aria-haspopup="dialog"
                aria-label={`${me.name} — ${t.theme.title}`}
              >
                <Avatar avatarId={me.avatarId} size={32} />
                <span className={styles.meName}>{me.name}</span>
              </button>
            </>
          ) : null}
        </div>
      </header>
      {countdownRow ? (
        // ADR-030: a quiet timer keeps the bar (a rhythm) but drops the digits and the urgency.
        <div
          className={`${styles.deadline} ${online && seconds <= 5 && !view.paused && view.timerMode !== 'quiet' ? styles.urgent : ''} ${online ? '' : styles.stale}`}
          role="timer"
          aria-label={view.paused ? t.tv.paused : t.connection.secondsLeft(seconds)}
        >
          <DeadlineBar
            deadline={view.deadline}
            phaseKey={view.phaseId}
            paused={view.paused}
            urgentAt={online ? 5 : 0}
          />
          {!online ? (
            <span className={`${styles.cue} ${styles.cueStale}`} role="status">
              {t.connection.reconnecting}
            </span>
          ) : candidate ? (
            <span className={styles.cue} aria-hidden>
              {t.connection.hurry}
            </span>
          ) : null}
          {view.timerMode !== 'quiet' || view.paused ? (
            <span className={styles.seconds}>
              {view.paused ? `⏸ ${t.tv.paused}` : t.connection.seconds(seconds)}
            </span>
          ) : null}
        </div>
      ) : null}
      {state.error && state.joined ? (
        <button
          type="button"
          className={`${styles.error} ${stripShaking ? styles.shake : ''}`}
          onAnimationEnd={() => setStripShaking(false)}
          onClick={controller.dismissError}
        >
          <span role="alert">
            <span aria-hidden>⚠ </span>
            {state.error.message}
          </span>
        </button>
      ) : null}
      <main
        ref={mainRef}
        className={`${styles.main} ${paused ? styles.pausedMain : ''}`}
        inert={paused}
      >
        {/* Overlays the top of the body and slides in (review-loop #20): a banner in the flow shoved
            the drawing sheet under a finger mid-stroke. */}
        {showBanner && !countdownRow ? (
          <div className={styles.banner} role="status">
            {t.connection.reconnecting}
          </div>
        ) : paused ? (
          <div className={styles.banner} role="status">
            {me?.isVip ? t.paused.vip : t.paused.other(vipName)}
          </div>
        ) : null}
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
          footer={<PhoneSettings audio={audio} />}
        />
      ) : null}
    </div>
  );
}
