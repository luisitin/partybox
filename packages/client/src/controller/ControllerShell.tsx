// Phone frame: header (room code, me, connection, VIP badge + menu), a countdown line during play
// (the TV timer is 3 m away), calm reconnect banner, toasts and the error strip. Everything below
// the header is the current screen. The shell also turns state transitions into the phone's own
// cues and haptics (docs/DESIGN_SYSTEM.md): the TV stays the audible focal point, so the phone
// only sounds for what happened in the player's hand (submit, error) and buzzes for the rest.
import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { PlayerPublic } from '@partybox/shared';
import { Avatar, getLang, useSecondsLeft } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import type { SoundEngine } from '../sound';
import { ThemePicker } from '../ThemePicker';
import styles from './ControllerShell.module.css';
import { PhoneSettings } from './PhoneSettings';
import { ThisPhone } from './ThisPhone';
import { ShareButton } from './ShareSheet';
import { linkLabel } from './flapFree';
import { useGraceLeft } from './grace';
import { BackCard, OfflineCard, snapshotOf, useLinkCard } from './OfflineCard';
import { serverText } from '../server-text';
import { usePhoneUrgency } from './urgency';
import { VipMenu, vipMenuState } from './VipMenu';
import { ReclaimVip } from './ReclaimVip';
import { JoinLangPick } from './JoinLangs';
import { ShellCountdown } from './ShellCountdown';
import { useShellCues } from './useShellCues';

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
  // I-642 B: the picker's Room row opens this menu
  useEffect(() => {
    const open = (): void => setMenuOpen(true);
    window.addEventListener('pb:vip-menu', open);
    return () => window.removeEventListener('pb:vip-menu', open);
  }, []);
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
  // I-791 D: a lost link is a state you can see — the game dims under one card (seat held, answer
  // sent or not), and the return is one "You're back" beat naming where the game is now. Steady
  // across a flapping connection (the owner, 2026-09-22); I-755 A: stepping aside is not a lost link.
  const trouble = !online && state.joined && !state.otherTab;
  const { card, before } = useLinkCard(trouble, snapshotOf(state.view, myStatus));
  const graceLeft = useGraceLeft(trouble); // I-089 C: the server's 120 s grace
  const countdownRow = view !== null && seconds !== null && view.timerMode !== 'hidden';
  const { candidate, shellRef, mainRef } = usePhoneUrgency({
    view,
    seconds,
    myStatus,
    audio,
    online,
  });

  useShellCues(state, myStatus, online, audio);

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      data-surface="controller"
      data-resync={card === 'off' ? undefined : card}
    >
      <header className={styles.header}>
        <div className={styles.left}>
          {/* I-167 A: paused, the header says so — nothing covers the page, nothing moves */}
          {paused ? (
            me?.isVip ? (
              // I-167 B: the VIP resumes right here
              <button
                type="button"
                className={`${styles.pausedHead} ${styles.pausedResume}`}
                onClick={() => controller.vip({ action: 'resume' })}
              >
                {t.paused.resume}
              </button>
            ) : (
              <span className={styles.pausedHead} role="status">
                {t.paused.head(vipName)}
              </span>
            )
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className={styles.right}>
          {/* I-793 F: the join page's language is one "🌐 EN ▾" up here, not a row of pills */}
          {!me ? <JoinLangPick /> : null}
          {/* I-666 B: once you're in, no 🎨 — your face opens the same sheet (the join page, with
              no face yet, keeps it) */}
          {!me ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setThemeOpen(true)}
              aria-haspopup="dialog"
              aria-label={t.theme.title}
            >
              🎨
            </button>
          ) : null}
          {/* I-666 C: the dot only when something is wrong */}
          {state.connection !== 'connected' ? (
            <span
              className={`${styles.dot} ${styles.off}`}
              role="status"
              aria-label={linkLabel(state.connection)}
            />
          ) : null}
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
        <ShellCountdown
          view={view}
          seconds={seconds}
          online={online}
          banner={null}
          hurry={candidate}
        />
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
        className={`${styles.main} ${paused ? styles.pausedMain : ''} ${card === 'offline' ? styles.offlineMain : ''}`}
        inert={paused || card !== 'off'}
      >
        {children}
        {card === 'back' ? (
          <BackCard before={before} view={view} seconds={seconds} playerId={state.playerId} />
        ) : null}
      </main>
      {card === 'offline' ? (
        <OfflineCard secondsLeft={graceLeft} before={before} playing={view !== null} />
      ) : null}
      {/* I-347 C: the host whose VIP passed on while they were away can take it back */}
      <div className={styles.pinned}>
        <ReclaimVip room={room} playerId={state.playerId} controller={controller} />
      </div>
      {/* S2: a toast drops over the header bar, never over what the player is reading or typing */}
      <div className={styles.toasts} aria-live="polite">
        {state.toasts.map((toast) => (
          // A status line, not a button: screen readers announce it once and it never masquerades
          // as an action (a "… is now the VIP" toast used to match button lookups for /VIP/).
          <div key={toast.id} role="status" className={`${styles.toast} ${styles[toast.kind]}`}>
            {serverText(toast.text, getLang(), room?.selectedGameId)}
          </div>
        ))}
      </div>
      {menuOpen && room && me?.isVip ? (
        <VipMenu
          controller={controller}
          room={room}
          me={me}
          {...vipMenuState(view)}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
      {themeOpen ? (
        <ThemePicker
          variant="sheet"
          onClose={() => setThemeOpen(false)}
          title={t.phone.thisPhone}
          header={
            <ThisPhone
              seeTv={
                me
                  ? { on: me.canSeeTv !== false, set: (on) => controller.setCanSeeTv(on) }
                  : undefined
              }
            />
          }
          footer={<PhoneSettings audio={audio} what={musicWhat} room={room} onLeave={leave} />}
        />
      ) : null}
    </div>
  );
}
