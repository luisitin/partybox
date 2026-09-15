// Lobby on the phone: who is here, and for the VIP the button that opens game selection.
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PlayerChip, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './Lobby.module.css';

export interface LobbyProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Lobby({ controller, room, me }: LobbyProps): JSX.Element {
  const first = room.games[0];
  const pick = (): void => {
    if (first) controller.vip({ action: 'selectGame', gameId: first.id });
  };
  return (
    <Screen
      title={t.lobby.title}
      footer={
        me.isVip ? (
          <PrimaryButton onClick={pick} disabled={!first}>
            {t.lobby.pickGame}
          </PrimaryButton>
        ) : undefined
      }
    >
      <p className="pb-muted">{me.isVip ? t.lobby.youAreVip : t.lobby.waitingForVip}</p>
      <p className={`pb-caption ${styles.count}`}>
        {t.lobby.players(room.players.length, room.capacity)}
        {room.locked ? ` · ${t.lobby.locked}` : ''}
      </p>
      <ul className={styles.list} aria-label="players">
        {room.players.map((p) => (
          <li key={p.id}>
            <PlayerChip
              name={p.name}
              avatarId={p.avatarId}
              connected={p.connected}
              isVip={p.isVip}
              status={p.spectator ? 'spectator' : 'active'}
              active={p.id === me.id}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
