// Phone frame: header (room code, me, connection, VIP badge + menu), a countdown line during play
// (the TV timer is 3 m away), calm reconnect banner, toasts and the error strip. Everything below
// the header is the current screen. The shell also turns state transitions into the phone's own
// cues and haptics (docs/DESIGN_SYSTEM.md): the TV stays the audible focal point, so the phone
// only sounds for what happened in the player's hand (submit, error) and buzzes for the rest.
import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { PlayerPublic } from '@partybox/shared';
import { Avatar, DeadlineBar, buzz, getLang, useSecondsLeft } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import type { SoundEngine } from '../sound';
import { ThemePicker } from '../ThemePicker';
import styles from './ControllerShell.module.css';
import { PhoneSettings, tvSoundsOn } from './PhoneSettings';
import { ShareButton } from './ShareSheet';
import { clientGames } from '../games.generated';
import type { SoundCue } from '../sound';
import { linkLabel, useLinkBanner } from './flapFree';
import { serverText } from '../server-text';
import { usePhoneUrgency } from './urgency';
import { VipMenu } from './VipMenu';

export interface ControllerShellProps {
  controller: Controller;
  state: ControllerState;
  me: PlayerPublic | null;
  /** The phone's sound engine; absent in /preview (silent). */
  audio?: SoundEngine;
  /** S-003 B: bump to open the 🎨 sheet from a screen (the lobby's setup pill). */
  openTheme?: number;
  /** S-004 B: what the phone's music is on ("Lobby set", "Bingo's set"). */
  musicWhat?: string | null;
  children: ReactNode;
}

/** Haptic patterns (ms on/off) — docs/DESIGN_SYSTEM.md → Haptics. */
const BUZZ: Record<
  'submit' | 'error' | 'prompt' | 'winner' | 'results' | 'back',
  number | number[]
> = {
  submit: 20,
  back: 30, // I-009 C: the link came back
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
  openTheme = 0,
  musicWhat = null,
  children,
}: ControllerShellProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [seenOpen, setSeenOpen] = useState(openTheme);
  if (openTheme !== seenOpen) {
    setSeenOpen(openTheme);
    if (openTheme > 0) setThemeOpen(true);
  }
  const room = state.room;
  // The owner (2026-09-22): leaving is reachable from the 🎨 sheet too, so a phone can get out
  // mid-game and not only from the lobby.
  const leave = (): void => {
    setThemeOpen(false);
    controller.leave();
  };
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
  // The link's own banner: one steady message across a flapping connection (the owner,
  // 2026-09-22), ending in "Back online" instead of vanishing.
  const { showBanner, text: reconnectingText } = useLinkBanner(
    !online && state.joined,
    state.joined,
  );
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
  // I-009 C: the link comes back — it lands in the hand: one short buzz and the `join` note.
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current) {
      audio?.play('join');
      buzz(BUZZ.back);
    }
    wasOnline.current = online;
  }, [online, audio]);
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
    // S-005 C: the TV's phase cue on this phone (a phone-only room, the phone opted in).
    if (
      playing &&
      phase !== null &&
      p.phase !== phase &&
      // a room that asked the phones to carry the audio (phone only, or music on every phone)
      (room?.phoneOnly || room?.musicOnPhones) &&
      tvSoundsOn() &&
      audio
    ) {
      const mapped = room.selectedGameId
        ? clientGames[room.selectedGameId]?.sounds?.[phase]
        : undefined;
      if (mapped && mapped !== 'silence') audio.play(mapped as SoundCue);
    }
    // A rejected join or input, once per error object: the strip goes red (Join renders the
    // same error inline).
    if (error && error !== p.error) {
      audio?.play('error');
      // I-040 C: a taken name buzzes twice — the one join error that is about someone else.
      buzz(error.code === 'name_taken' ? [40, 60, 40] : BUZZ.error);
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
            // I-666 A: the code is the thing people ask for — tap it to share the room
            <ShareButton
              code={room.code}
              className={`${styles.code} ${styles.codeButton}`}
              label={room.code}
              ariaLabel={`${t.lobby.room} ${room.code} — ${t.share.button}`}
            />
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
            className={`${styles.dot} ${state.connection === 'connected' ? `${styles.on} ${styles.beat}` : styles.off}`}
            role="status"
            aria-label={linkLabel(state.connection)}
          />
          {me ? (
            <>
              {/* Offline, the badge may already be stale (the server hands the VIP over after 30 s):
                  it stays put but dimmed and disabled until the snapshot is fresh — unmounting it
                  shoved the dot and avatar on every drop and return (review-loop #33). */}
              {me.isVip ? (
                <button
                  type="button"
                  className={`${styles.vipBadge} ${online ? '' : styles.vipBadgeStale}`}
                  onClick={() => setMenuOpen(true)}
                  aria-haspopup="dialog"
                  disabled={!online}
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
          {showBanner ? (
            <span className={`${styles.cue} ${styles.cueStale}`} role="status">
              {reconnectingText}
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
            {serverText(state.error.message, getLang(), room?.selectedGameId)}
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
            {reconnectingText}
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
            {serverText(toast.text, getLang(), room?.selectedGameId)}
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
          footer={<PhoneSettings audio={audio} what={musicWhat} room={room} onLeave={leave} />}
        />
      ) : null}
    </div>
  );
}
