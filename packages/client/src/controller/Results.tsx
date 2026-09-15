// Results on the phone: compact scoreboard with "me" highlighted; the VIP gets play again /
// new game / lobby. Everyone else sees who won and waits.
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PrimaryButton, Scoreboard, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import { scoreboardRows, winnerLine } from './results-rows';
import styles from './Results.module.css';

export interface ResultsProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Results({ controller, room, me }: ResultsProps): JSX.Element {
  const rows = scoreboardRows(room);
  return (
    <Screen
      title={t.results.title}
      footer={
        me.isVip ? (
          <div className={styles.actions}>
            <PrimaryButton onClick={() => controller.vip({ action: 'playAgain' })}>
              {t.results.playAgain}
            </PrimaryButton>
            <div className={styles.row}>
              <PrimaryButton
                tone="neutral"
                onClick={() =>
                  controller.vip({
                    action: 'selectGame',
                    gameId: room.selectedGameId ?? room.games[0]?.id ?? '',
                  })
                }
              >
                {t.results.newGame}
              </PrimaryButton>
              <PrimaryButton tone="neutral" onClick={() => controller.vip({ action: 'toLobby' })}>
                {t.results.lobby}
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <p className={`pb-muted ${styles.wait}`}>{t.results.waitingForVip}</p>
        )
      }
    >
      <p className={styles.winner}>{winnerLine(room)}</p>
      <Scoreboard rows={rows} compact highlightId={me.id} />
      {room.results?.results.awards.length ? (
        <ul className={styles.awards}>
          {room.results.results.awards.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong> —{' '}
              {room.results?.players.find((p) => p.id === a.playerId)?.name ?? '?'}
              <span className="pb-muted pb-caption"> {a.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Screen>
  );
}
