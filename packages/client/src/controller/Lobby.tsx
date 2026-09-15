// Lobby on the phone: who is here, "Add a bot" for everyone (ADR-028), and for the VIP the
// button that opens game selection.
import type { JSX } from 'react';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
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
  const myBots = room.players.filter((p) => p.bot?.ownerId === me.id);
  const canAddBot = myBots.length < MAX_BOTS_PER_OWNER && room.players.length < room.capacity;
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
              isBot={p.bot !== undefined}
              status={p.spectator ? 'spectator' : 'active'}
              isMe={p.id === me.id}
            />
          </li>
        ))}
      </ul>
      <section className={styles.bots} aria-label={t.lobby.yourBots}>
        <button
          type="button"
          className={styles.addBot}
          onClick={() => controller.bot({ action: 'add' })}
          disabled={!canAddBot}
        >
          🤖 {t.lobby.addBot}
        </button>
        <p className="pb-caption pb-muted">{t.lobby.addBotHint}</p>
        {myBots.length > 0 ? (
          <ul className={styles.botList}>
            {myBots.map((bot) => (
              <li key={bot.id} className={styles.botRow}>
                <span className={styles.botName}>{bot.name}</span>
                <button
                  type="button"
                  className={styles.removeBot}
                  onClick={() => controller.bot({ action: 'remove', botId: bot.id })}
                  aria-label={`${t.lobby.removeBot} ${bot.name}`}
                >
                  {t.lobby.removeBot}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </Screen>
  );
}
