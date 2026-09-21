// Lobby on the phone: who is here (bots included, with ✕ on the ones you may remove), a
// "＋ Add a bot" chip at the end of the grid (ADR-028), and for the VIP the button that opens
// game selection.
import { useState } from 'react';
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
  // I-074 A: a removed bot puffs out before the remove is sent (450 ms, one poof at a time).
  const [poofing, setPoofing] = useState<string | null>(null);
  const poof = (botId: string): void => {
    if (poofing) return;
    setPoofing(botId);
    setTimeout(() => {
      controller.bot({ action: 'remove', botId });
      setPoofing(null);
    }, 450);
  };
  const first = room.games[0];
  const pick = (): void => {
    if (first) controller.vip({ action: 'selectGame', gameId: first.id });
  };
  const myBots = room.players.filter((p) => p.bot?.ownerId === me.id);
  const full = room.players.length >= room.capacity;
  const maxed = myBots.length >= MAX_BOTS_PER_OWNER;
  const canAddBot = !maxed && !full;
  const addLabel = full ? t.lobby.full : maxed ? t.lobby.botsMaxed : t.lobby.addBot;
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
        {room.players.map((p) => {
          // The owner or the VIP may remove a bot (ADR-028): one tap, no confirm — re-adding is one tap too.
          const removable = p.bot !== undefined && (p.bot.ownerId === me.id || me.isVip);
          return (
            <li key={p.id} className={`${styles.item} ${poofing === p.id ? styles.poof : ''}`}>
              {poofing === p.id ? (
                <span className={styles.bits} aria-hidden>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
              <PlayerChip
                name={p.name}
                avatarId={p.avatarId}
                connected={p.connected}
                isVip={p.isVip}
                isBot={p.bot !== undefined}
                status={p.spectator ? 'spectator' : 'active'}
                isMe={p.id === me.id}
                onRemove={removable ? () => poof(p.id) : undefined}
                removeLabel={`${t.lobby.removeBot} ${p.name}`}
              />
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className={styles.addBot}
            onClick={() => controller.bot({ action: 'add' })}
            disabled={!canAddBot}
            aria-label={t.lobby.addBot}
          >
            <span className={styles.addBotPlus} aria-hidden>
              ＋
            </span>
            🤖 {addLabel}
          </button>
        </li>
      </ul>
      <p className="pb-caption pb-muted">{t.lobby.addBotHint}</p>
    </Screen>
  );
}
