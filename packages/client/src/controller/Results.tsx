// Results on the phone: the winner line in the first person ("You win!"), my place and score, the
// compact scoreboard with "me" marked; the VIP gets play again / new game / lobby, everyone else
// waits for the VIP by name. The board shows the instant the TV's does (the phone never spoils,
// and never hides a board the TV is already showing); the cue + buzz come from the shell.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PrimaryButton, Scoreboard, Screen } from '@partybox/game-sdk/ui';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import { myRow, nobodyScored, scoreboardRows, winnerLineFor } from './results-rows';
import styles from './Results.module.css';

export interface ResultsProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Results({ controller, room, me }: ResultsProps): JSX.Element {
  // Your own row is what you look for first: bring it above the sticky footer (review-loop #15).
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, []);
  const rows = scoreboardRows(room);
  const mine = myRow(room, me.id);
  const scoreless = room.results ? clientGames[room.results.gameId]?.scoreless === true : false;
  const over = nobodyScored(room) && !scoreless;
  const vipName = room.players.find((p) => p.id === room.vip)?.name;
  return (
    <Screen
      // The winner line is the sticky title: on a long board the body scrolls to your own row and a
      // hero inside the body scrolled off the top (review-loop #76).
      title={
        <span className={styles.winner} data-screen="results">
          {winnerLineFor(room, me.id, scoreless)}
        </span>
      }
      footer={
        me.isVip ? (
          <div className={styles.actions}>
            <PrimaryButton onClick={() => controller.vip({ action: 'playAgain' })}>
              {t.results.playAgain}
            </PrimaryButton>
            <div className={styles.row}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  controller.vip({
                    action: 'selectGame',
                    gameId: room.selectedGameId ?? room.games[0]?.id ?? '',
                  })
                }
              >
                {t.results.newGame}
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => controller.vip({ action: 'toLobby' })}
              >
                {t.results.lobby}
              </button>
            </div>
          </div>
        ) : (
          <p className={`pb-muted ${styles.wait}`}>
            {vipName ? t.results.waitingFor(vipName) : t.results.waitingForVip}
          </p>
        )
      }
    >
      {over ? <p className="pb-muted pb-caption">{t.results.nobodyScored}</p> : null}
      {mine && !over && !scoreless ? (
        <p className={`pb-muted pb-caption ${styles.place}`}>
          {t.results.yourPlace(mine.rank, mine.score)}
        </p>
      ) : null}
      {scoreless ? (
        // No points: a board of zeros says nothing; the TV holds the show's summary.
        <p className="pb-muted pb-caption">
          {room.phoneOnly ? t.results.scorelessHintPhones : t.results.scorelessHint}
        </p>
      ) : (
        <div ref={list}>
          <Scoreboard rows={rows} compact highlightId={me.id} noTrophy={over} />
        </div>
      )}
      {room.results?.results.awards.length ? (
        <ul className={styles.awards}>
          {room.results.results.awards.map((a) => (
            <li key={a.id} className={styles.award}>
              <span>
                <strong>{a.title}</strong> ·{' '}
                {room.results?.players.find((p) => p.id === a.playerId)?.name ?? '?'}
              </span>
              <span className="pb-muted pb-caption">{a.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Screen>
  );
}
