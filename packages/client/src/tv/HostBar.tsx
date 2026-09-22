// Host controls on the TV/PC (ADR-031): the screen the party is run from has every VIP power —
// pick and start games, add bots, pause / skip / end, play again. The frame's bottom row, so the
// stage never has to dodge it; destructive actions ask once (click again within 4 s). Home is
// the frame's 🏠 (TvFrame).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { LIMITS } from '@partybox/shared';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { t } from '../i18n';
import type { TvClient } from '../net/tv';
import styles from './HostBar.module.css';

export interface HostBarProps {
  client: TvClient;
  room: RoomSnapshot;
  view: PushedView<TvView> | null;
}

const CONFIRM_MS = 4000;

/** Who the engine hands the VIP to: the longest-joined connected person (players.ts promoteVip). */
function nextVipName(room: RoomSnapshot): string | null {
  const next = room.players
    .filter((p) => p.connected && p.id !== room.vip && !p.bot && !p.spectator)
    .sort((a, b) => a.joinedAt - b.joinedAt)[0];
  return next?.name ?? null;
}

/**
 * While the VIP's phone is disconnected the engine hands the role over after LIMITS.vipHandoverMs;
 * the room only saw a spinner on a chip for that half minute (review-loop #34). Counted locally
 * from the first snapshot that shows the VIP offline (the server flips `connected` on socket
 * close, so this trails the engine's clock by a push at most); a 1 s tick keeps the digits moving.
 */
function useVipAway(room: RoomSnapshot): { next: string | null; seconds: number } | null {
  const vip = room.players.find((p) => p.id === room.vip);
  const away = vip !== undefined && !vip.connected;
  const [tick, setTick] = useState<{ now: number; since: number | null }>({ now: 0, since: null });
  useEffect(() => {
    if (!away) return;
    const update = (): void => setTick((t) => ({ now: Date.now(), since: t.since ?? Date.now() }));
    const handle = setInterval(update, 1000);
    return () => {
      clearInterval(handle);
      setTick({ now: 0, since: null });
    };
  }, [away]);
  if (!away || tick.since === null) return null;
  const seconds = Math.max(0, Math.ceil((tick.since + LIMITS.vipHandoverMs - tick.now) / 1000));
  return { next: nextVipName(room), seconds };
}

export function HostBar({ client, room, view }: HostBarProps): JSX.Element | null {
  const [confirm, setConfirm] = useState<string | null>(null);
  useEffect(() => {
    if (confirm === null) return;
    const handle = setTimeout(() => setConfirm(null), CONFIRM_MS);
    return () => clearTimeout(handle);
  }, [confirm]);
  const act = (key: string, run: () => void, dangerous = false): void => {
    if (dangerous && confirm !== key) {
      setConfirm(key);
      return;
    }
    setConfirm(null);
    run();
  };
  const label = (key: string, text: string): string => (confirm === key ? `Sure? ${text}` : text);
  const vipAway = useVipAway(room);
  const bots = room.players.filter((p) => p.bot);
  const full = room.players.length >= room.capacity;
  const firstGame = room.games[0];
  const game = room.games.find((g) => g.id === room.selectedGameId);

  const botButtons = (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={() => client.bot({ action: 'add' })}
        disabled={full}
        title={full ? t.lobby.full : t.lobby.addBotHint}
      >
        🤖 {t.lobby.addBot}
      </button>
      {bots.length > 0 ? (
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            for (const bot of bots) client.bot({ action: 'remove', botId: bot.id });
          }}
        >
          ✕ {t.host.removeBots(bots.length)}
        </button>
      ) : null}
    </>
  );

  let buttons: JSX.Element;
  switch (room.status) {
    case 'lobby':
      buttons = (
        <>
          {botButtons}
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            disabled={!firstGame}
            onClick={() => firstGame && client.act({ action: 'selectGame', gameId: firstGame.id })}
          >
            🎮 {t.host.pickGame}
          </button>
        </>
      );
      break;
    case 'selecting':
      buttons = (
        <>
          {botButtons}
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            disabled={!room.canStart.ok}
            title={room.canStart.ok ? undefined : room.canStart.reason}
            onClick={() => client.act({ action: 'start' })}
          >
            ▶ {t.selecting.start}
            {game ? ` ${game.name}` : ''}
          </button>
        </>
      );
      break;
    case 'playing':
      buttons = (
        <>
          <button
            type="button"
            className={styles.button}
            onClick={() => client.act({ action: view?.paused ? 'resume' : 'pause' })}
          >
            {view?.paused ? `▶ ${t.vip.resume}` : `⏸ ${t.vip.pause}`}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => client.act({ action: 'skip' })}
          >
            ⏭ {t.host.skip}
          </button>
          <button
            type="button"
            className={`${styles.button} ${confirm === 'end' ? styles.danger : ''}`}
            onClick={() => act('end', () => client.act({ action: 'end' }), true)}
          >
            ■ {label('end', t.vip.end)}
          </button>
        </>
      );
      break;
    default:
      buttons = (
        <>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            disabled={!room.canStart.ok}
            title={room.canStart.ok ? undefined : room.canStart.reason}
            onClick={() => client.act({ action: 'playAgain' })}
          >
            ↻ {t.results.playAgain}
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={!firstGame}
            onClick={() =>
              client.act({
                action: 'selectGame',
                gameId: room.selectedGameId ?? firstGame?.id ?? '',
              })
            }
          >
            🎮 {t.results.newGame}
          </button>
        </>
      );
  }

  return (
    <div className={styles.bar} role="toolbar" aria-label={t.host.title}>
      {/* I-071 A: the room's one badge for "who runs this" — the roster's ★ pill. */}
      <span className={`${styles.label} ${styles.pill}`}>
        <span aria-hidden>★</span> {t.host.title}
      </span>
      {vipAway ? (
        <span className={styles.away} role="status">
          {vipAway.next ? t.host.vipAway(vipAway.next, vipAway.seconds) : t.host.vipAwayNobody}
        </span>
      ) : null}
      {buttons}
    </div>
  );
}
