// Host controls on the TV/PC (ADR-031): the screen the party is run from has every VIP power —
// pick and start games, add bots, pause / skip / end, play again — and the TV's language (🌐). The
// frame's bottom row, so the stage never has to dodge it; destructive actions ask once (click again
// within 4 s). Home is the frame's 🏠 (TvFrame).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { LIMITS } from '@partybox/shared';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { setLang, useT } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import type { TvClient } from '../net/tv';
import { serverText } from '../server-text';
import { STRINGS } from './strings';
import styles from './HostBar.module.css';
import { fixLabel, runFix, startFix } from '../startFix';

/** I-053 B: a glyph per game on the shelf (games carry no icon of their own). */
const GAME_GLYPH: Record<string, string> = {
  bingo: '🎱',
  blanks: '✍️',
  'lightning-round': '⚡',
  wisecrack: '😂',
  'broken-pencil': '✏️',
};

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
  const L = useT(STRINGS);
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
  const label = (key: string, text: string): string =>
    confirm === key ? L('Sure? {action}', { action: text }) : text;
  const vipAway = useVipAway(room);
  const info = useServerInfo(5000); // I-077 C
  // I-071 B: the bar says whose controls these are.
  const vipName = room.players.find((p) => p.id === room.vip)?.name ?? null;
  const bots = room.players.filter((p) => p.bot);
  // I-667 B: what would let the picked game start — the exact bots, not all of them
  const picked = room.games.find((g) => g.id === room.selectedGameId);
  const fix =
    room.status === 'selecting' && !room.canStart.ok && picked ? startFix(room, picked) : null;
  const full = room.players.length >= room.capacity;
  const firstGame = room.games[0];
  // I-053 A: the game button turns its label over — the shelf, one game at a time (0 = the label).
  const [shelf, setShelf] = useState(0);
  useEffect(() => {
    if (room.status !== 'lobby' || room.games.length === 0) return undefined;
    const h = setInterval(() => setShelf((s) => (s + 1) % (room.games.length + 1)), 2200);
    return () => clearInterval(h);
  }, [room.status, room.games.length]);
  const shelfGame = shelf === 0 ? null : (room.games[shelf - 1] ?? null);
  const game = room.games.find((g) => g.id === room.selectedGameId);
  // Why Start is off: the engine's sentence, in the TV's language.
  const cannotStart = room.canStart.ok
    ? undefined
    : serverText(room.canStart.reason, L.lang, room.selectedGameId);
  // The owner (2026-09-22): the room's screen speaks Spanish too. The button offers the other
  // language in its own words; a browser in de / fr / pt counts as English here.
  const spanish = L.lang === 'es';
  const switchLabel = spanish ? L('Switch the TV to English') : L('Switch the TV to Spanish');

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
      {fix ? (
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={() => runFix(fix, (a) => client.bot(a))}
        >
          {fix.kind === 'remove' ? '✕' : '🤖'}{' '}
          {fixLabel(fix, {
            removeToPlay: (n) =>
              n === 1 ? L('Remove 1 bot to play') : L('Remove {n} bots to play', { n }),
            removeAll: (n) => (n === 1 ? L('Remove the bot') : L('Remove the {n} bots', { n })),
            addToPlay: (n) => (n === 1 ? L('Add 1 bot to play') : L('Add {n} bots to play', { n })),
          })}
        </button>
      ) : null}
      {bots.length > 0 && fix?.kind !== 'remove' ? (
        <button
          type="button"
          className={`${styles.button} ${bots.length >= 4 ? styles.buttonDanger : ''}`}
          onClick={() => {
            // Spaced, not a burst: a bot action costs 5 of the socket's 20 tokens a second, so
            // thirteen at once left bots behind under "Slow down." (found recording I-048).
            bots.forEach((bot, i) =>
              setTimeout(() => client.bot({ action: 'remove', botId: bot.id }), i * 300),
            );
          }}
        >
          ✕{' '}
          {bots.length >= 4
            ? L('Remove all {n} bots', { n: bots.length })
            : t.host.removeBots(bots.length)}
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
          {/* I-682 C: no game to pick until a person is in */}
          {room.players.some((p) => !p.bot) ? (
            <button
              type="button"
              className={`${styles.button} ${styles.primary}`}
              disabled={!firstGame}
              onClick={() =>
                firstGame && client.act({ action: 'selectGame', gameId: firstGame.id })
              }
            >
              <span key={shelf} className={styles.turn}>
                {shelfGame ? (GAME_GLYPH[shelfGame.id] ?? '🎮') : '🎮'}{' '}
                {shelfGame ? shelfGame.name : t.host.pickGame}
              </span>
            </button>
          ) : null}
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
            title={cannotStart}
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
            ⏭{' '}
            {view?.vipSkipLabel
              ? serverText(view.vipSkipLabel, L.lang, room.selectedGameId)
              : t.host.skip}
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
            title={cannotStart}
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
        <span aria-hidden>★</span> {vipName ?? t.host.title}
      </span>
      {/* I-077 C: the gap, live — phones that opened the join page vs. got in. */}
      {info?.funnel && info.funnel.opened > 0 ? (
        <span className={styles.label} title={L('phones that opened the join page · joined')}>
          {L('{opened} opened · {joined} in', {
            opened: info.funnel.opened,
            joined: info.funnel.joined,
          })}
        </span>
      ) : null}
      {vipAway ? (
        <span className={styles.away} role="status">
          {vipAway.next ? t.host.vipAway(vipAway.next, vipAway.seconds) : t.host.vipAwayNobody}
        </span>
      ) : null}
      <button
        type="button"
        className={styles.button}
        onClick={() => setLang(spanish ? 'en' : 'es')}
        aria-label={switchLabel}
        title={switchLabel}
      >
        🌐 {spanish ? 'English' : 'Español'}
      </button>
      {buttons}
    </div>
  );
}
