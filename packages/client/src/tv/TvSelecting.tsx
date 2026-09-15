// The VIP is choosing: show the highlighted game big, its settings, and who is here.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { BigText, PlayerChips, Stage } from '@partybox/game-sdk';
import { t } from '../i18n';
import styles from './TvSelecting.module.css';

export interface TvSelectingProps {
  room: RoomSnapshot;
}

export function TvSelecting({ room }: TvSelectingProps): JSX.Element {
  const game = room.games.find((g) => g.id === room.selectedGameId);
  const vip = room.players.find((p) => p.isVip);
  return (
    <Stage>
      <p className="pb-muted">{t.selecting.vipChoosing(vip?.name ?? 'The VIP')}</p>
      {game ? (
        <div className={`${styles.card} pb-enter`} key={game.id}>
          <BigText level="display">{game.name}</BigText>
          <BigText level="h2" tone="accent">
            {game.tagline}
          </BigText>
          <p className={styles.description}>{game.description}</p>
          <p className={styles.meta}>
            {t.selecting.players(game.minPlayers, game.maxPlayers)} ·{' '}
            {t.selecting.minutes(game.estimatedMinutes)}
          </p>
          {game.settings.length > 0 ? (
            <ul className={styles.settings}>
              {game.settings.map((s) => (
                <li key={s.key}>
                  <span className="pb-muted">{s.label}</span>{' '}
                  <strong>{String(room.settings[s.key] ?? s.default)}</strong>
                </li>
              ))}
            </ul>
          ) : null}
          {!room.canStart.ok ? <p className={styles.reason}>{room.canStart.reason}</p> : null}
        </div>
      ) : null}
      <PlayerChips
        players={room.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatarId: p.avatarId,
          connected: p.connected,
          status: p.spectator ? 'spectator' : 'active',
        }))}
        vip={room.vip}
        layout="grid"
      />
    </Stage>
  );
}
