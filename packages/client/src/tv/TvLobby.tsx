// Lobby on the stage: the join instructions (big) and everyone who is in. First player = VIP.
// An empty lobby breathes (heading + waiting dots); a join pops its chip
// into the first seat and bumps the count — so the eye lands on the chip, not a toast.
import type { JSX } from 'react';
import { LIMITS } from '@partybox/shared';
import type { RoomSnapshot } from '@partybox/shared';
import { useEffect, useState } from 'react';
import { Avatar, BigText, PlayerChips, Stage, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import { STRINGS } from './strings';
import styles from './TvLobby.module.css';

export interface TvLobbyProps {
  room: RoomSnapshot | null;
  /** I-040 B: players a live toast is about — their chips are ringed while it shows. */
  nudgeIds?: string[];
}

/** "Sam", "Sam and Priya", "Sam, Priya and Bot 2". */
function listNames(L: Translator, names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return L('{names} and {last}', {
    names: names.slice(0, -1).join(', '),
    last: names[names.length - 1] ?? '',
  });
}

const LAST_UP_FACES = 4;

/** I-073 A: the "last up" card — the game's name and who won it. The owner's note: one winner
 *  "Sam won", a tie "Sam and Priya tied" (faces first, four at most then "+n"), an abandoned or
 *  scoreless game "no winner" in the muted colour with no face. */
function LastUp({ room }: { room: RoomSnapshot }): JSX.Element | null {
  const L = useT(STRINGS);
  const r = room.results;
  if (!r) return null;
  const game = room.games.find((g) => g.id === r.gameId)?.name ?? r.gameId;
  // Nobody scored (the VIP ended it early, a room that never answered): every "winner" is on
  // zero — that is no winner, not a sixteen-way tie.
  const scored = r.results.winnerIds.some((id) => (r.results.scores[id] ?? 0) > 0);
  const winners = (scored ? r.results.winnerIds : [])
    .map((id) => r.players.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
  const shown = winners.slice(0, LAST_UP_FACES);
  const more = winners.length - shown.length;
  const names = [...shown.map((w) => w.name), ...(more > 0 ? [`+${more}`] : [])];
  return (
    <aside className={styles.lastUp} aria-label={L('last game')}>
      <span className={styles.lastUpKicker}>{L('Last up · {game}', { game })}</span>
      {winners.length === 0 ? (
        <span className={`${styles.lastUpWinner} ${styles.lastUpNone}`}>{L('no winner')}</span>
      ) : (
        <span className={styles.lastUpWinner}>
          <span className={styles.lastUpFaces}>
            {shown.map((w) => (
              <Avatar key={w.id} avatarId={w.avatarId} size={32} />
            ))}
          </span>
          {winners.length === 1
            ? L('{names} won', { names: listNames(L, names) })
            : L('{names} tied', { names: listNames(L, names) })}
        </span>
      )}
    </aside>
  );
}

/**
 * I-089 A: seconds of grace left per dropped player — counted from the first tick that sees them
 * offline (the server flips `connected` on socket close), 1 s tick while any is out. Same shape as
 * HostBar's `useVipAway`: the interval owns the state, so render stays pure and no ref is read
 * during it (the preview branch kept the timestamps in a ref, which this repo's react-hooks rules
 * reject).
 */
function useAwayLeft(
  players: readonly { id: string; connected: boolean }[],
): Record<string, number> {
  const offline = players
    .filter((p) => !p.connected)
    .map((p) => p.id)
    .sort()
    .join(',');
  const [tick, setTick] = useState<{ now: number; since: Record<string, number> }>({
    now: 0,
    since: {},
  });
  useEffect(() => {
    if (offline === '') return undefined;
    const ids = offline.split(',');
    const update = (): void =>
      setTick((t) => {
        const now = Date.now();
        const since: Record<string, number> = {};
        for (const id of ids) since[id] = t.since[id] ?? now;
        return { now, since };
      });
    const handle = setInterval(update, 1000);
    return () => clearInterval(handle);
  }, [offline]);
  const out: Record<string, number> = {};
  for (const [id, at] of Object.entries(tick.since))
    out[id] = Math.max(0, Math.round((at + LIMITS.disconnectGraceMs - tick.now) / 1000));
  return out;
}

export function TvLobby({ room, nudgeIds = [] }: TvLobbyProps): JSX.Element {
  const L = useT(STRINGS);
  const info = useServerInfo();
  const players = room?.players ?? [];
  const awayLeft = useAwayLeft(players); // I-089 A
  const vip = players.find((p) => p.isVip);
  const full = room !== null && players.length >= room.capacity;
  // I-055 A: a locked room reads on the QR panel, like a full one.
  const locked = room?.locked ?? false;
  const empty = players.length === 0;
  // I-072: the QR is big while nobody has joined and shrinks with the first join.
  const [wasEmpty, setWasEmpty] = useState(empty);
  const [shrinking, setShrinking] = useState(false);
  if (empty !== wasEmpty) {
    setWasEmpty(empty);
    setShrinking(!empty);
  }
  return (
    <Stage>
      {/* I-029 B: the room breathes — two soft glows drift behind the lobby (transform only). */}
      <div className={styles.glow} aria-hidden>
        <span className={styles.glowA} />
        <span className={styles.glowB} />
      </div>
      <div className={`${styles.split} ${empty ? styles.splitEmpty : ''}`}>
        <div className={`${styles.join} ${full || locked ? styles.full : ''}`}>
          <BigText
            level="h2"
            tone={full || locked ? 'accent' : 'muted'}
            className={empty ? styles.scanIdle : ''}
          >
            {locked ? t.lobby.locked : full ? t.lobby.full : t.lobby.scan}
          </BigText>
          {info ? (
            <span
              className={`${styles.qrWrap} ${empty ? styles.qrBig : ''} ${shrinking ? styles.qrShrink : ''}`}
              onAnimationEnd={() => setShrinking(false)}
            >
              <span
                className={styles.qr}
                dangerouslySetInnerHTML={{ __html: info.qrSvg }}
                role="img"
                aria-label={L('QR code for {url}', { url: info.joinUrl })}
              />
              {/* I-075 A: the PartyBox mark in the code's centre (error level H covers it). */}
              <span
                key={room?.players.length ?? 0}
                className={`${styles.qrMark} ${styles.qrMarkBump}`}
                aria-hidden
              >
                PB
              </span>
            </span>
          ) : null}
          <p className={styles.or}>{t.lobby.orOpen}</p>
          <BigText level="h2" tone="accent" className={styles.url}>
            {info ? info.joinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '…'}
          </BigText>
          {room ? (
            <p className={styles.code}>
              <span className={`${styles.badge} ${styles.badgeLarge}`}>
                <small>{t.lobby.room}</small>
                {room.code.split('').map((ch, i) => (
                  <span key={i} className={styles.letter} style={{ animationDelay: `${i * 80}ms` }}>
                    {ch}
                  </span>
                ))}
              </span>
            </p>
          ) : null}
        </div>
        <div className={`${styles.players} ${empty ? styles.playersHidden : ''}`}>
          <BigText key={players.length} level="h2" className={styles.count}>
            {room ? t.lobby.players(players.length, room.capacity) : t.connection.connecting}
          </BigText>
          <PlayerChips
            players={players.map((p) => ({
              id: p.id,
              name: p.name,
              avatarId: p.avatarId,
              connected: p.connected,
              status: p.spectator ? 'spectator' : 'active',
            }))}
            vip={room?.vip}
            // I-045 A: the room waits on the VIP — their chip carries the ring.
            activeIds={vip ? [...nudgeIds, vip.id] : nudgeIds}
            wavingIds={nudgeIds.filter((id) => id !== vip?.id)}
            awayLeft={awayLeft}
            botIds={players.filter((p) => p.bot).map((p) => p.id)}
            layout="grid"
            size={players.length > 8 ? 'md' : 'lg'}
            align="start"
            enter
          />
          {empty ? (
            <p className="pb-muted">
              {t.lobby.waitingForFirst.replace(/…$/, '')}
              {[0, 1, 2].map((i) => (
                <span key={i} className={styles.dot} aria-hidden="true">
                  .
                </span>
              ))}
            </p>
          ) : room && vip ? (
            <p className="pb-muted">{t.lobby.waitingFor(vip.name)}</p>
          ) : null}
          {/* I-073 A: the last game, still on the table until the next one starts. */}
          {room?.results ? <LastUp room={room} /> : null}
        </div>
      </div>
    </Stage>
  );
}
