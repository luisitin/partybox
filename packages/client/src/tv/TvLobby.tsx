// Lobby on the stage: the join instructions (big) and everyone who is in. First player = VIP.
// An empty lobby breathes (heading + waiting dots); a join pops its chip
// into the first seat and bumps the count — so the eye lands on the chip, not a toast.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { BigText, PlayerChips, Stage } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import styles from './TvLobby.module.css';

export interface TvLobbyProps {
  room: RoomSnapshot | null;
}

export function TvLobby({ room }: TvLobbyProps): JSX.Element {
  const info = useServerInfo();
  const players = room?.players ?? [];
  const vip = players.find((p) => p.isVip);
  const full = room !== null && players.length >= room.capacity;
  const empty = players.length === 0;
  return (
    <Stage>
      {/* I-029 B: the room breathes — two soft glows drift behind the lobby (transform only). */}
      <div className={styles.glow} aria-hidden>
        <span className={styles.glowA} />
        <span className={styles.glowB} />
      </div>
      <div className={styles.split}>
        <div className={`${styles.join} ${full ? styles.full : ''}`}>
          <BigText
            level="h2"
            tone={full ? 'accent' : 'muted'}
            className={empty ? styles.scanIdle : ''}
          >
            {full ? t.lobby.full : t.lobby.scan}
          </BigText>
          {info ? (
            <span className={styles.qrWrap}>
              <span
                className={styles.qr}
                dangerouslySetInnerHTML={{ __html: info.qrSvg }}
                role="img"
                aria-label={`QR code for ${info.joinUrl}`}
              />
              {/* I-042 A: the door sign over the code while the room is full. */}
              {full ? (
                <span className={styles.sign}>
                  <strong>ROOM FULL</strong>
                  <small>
                    {room?.capacity ?? 16} / {room?.capacity ?? 16} · a seat opens when someone leaves
                  </small>
                </span>
              ) : null}
            </span>
          ) : null}
          <p className={styles.or}>{t.lobby.orOpen}</p>
          <BigText level="h2" tone="accent" className={styles.url}>
            {info ? info.joinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '…'}
          </BigText>
          {room ? (
            <p className={styles.code}>
              {t.lobby.room} <strong>{room.code}</strong>
            </p>
          ) : null}
        </div>
        <div className={styles.players}>
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
        </div>
      </div>
    </Stage>
  );
}
