// Lobby on the stage: the join instructions (big) and everyone who is in. First player = VIP.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { BigText, PlayerChips, Stage } from '@partybox/game-sdk';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import styles from './TvLobby.module.css';

export interface TvLobbyProps {
  room: RoomSnapshot | null;
}

export function TvLobby({ room }: TvLobbyProps): JSX.Element {
  const info = useServerInfo();
  const players = room?.players ?? [];
  return (
    <Stage>
      <div className={styles.split}>
        <div className={styles.join}>
          <BigText level="h2" tone="muted">
            {t.lobby.scan}
          </BigText>
          {info ? (
            <span
              className={styles.qr}
              dangerouslySetInnerHTML={{ __html: info.qrSvg }}
              role="img"
              aria-label={`QR code for ${info.joinUrl}`}
            />
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
          <BigText level="h2">
            {room ? t.lobby.players(players.length, room.capacity) : t.connection.connecting}
          </BigText>
          {players.length === 0 ? (
            <p className="pb-muted">
              {t.lobby.waitingForVip.replace('the VIP to pick a game', 'the first player')}
            </p>
          ) : (
            <PlayerChips
              players={players.map((p) => ({
                id: p.id,
                name: p.name,
                avatarId: p.avatarId,
                connected: p.connected,
                status: p.spectator ? 'spectator' : 'active',
              }))}
              vip={room?.vip}
              layout="grid"
              size="lg"
            />
          )}
          {room && room.vip ? <p className="pb-muted pb-caption">{t.lobby.waitingForVip}</p> : null}
        </div>
      </div>
    </Stage>
  );
}
