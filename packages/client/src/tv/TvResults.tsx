// Results on the stage: celebrate the winner, show the scoreboard and awards, tell the room
// what the VIP can do next. A game whose last board IS the finale (Lightning's final-wager
// reveal) keeps it up here instead of the scoreboard, until Play again / New game / Home — the
// room stays in `results` until someone acts (owner request 2026-09-15).
import { Suspense } from 'react';
import type { JSX } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { BigText, Scoreboard, Stage } from '@partybox/game-sdk/ui';
import { GameErrorBoundary } from '../controller/GameErrorBoundary';
import { nobodyScored, scoreboardRows, winnerLine } from '../controller/results-rows';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import styles from './TvResults.module.css';

export interface TvResultsProps {
  room: RoomSnapshot;
  /** The last view the stage showed while playing (null after a reload). */
  lastView?: PushedView<TvView> | null;
}

export function TvResults({ room, lastView = null }: TvResultsProps): JSX.Element {
  const rows = scoreboardRows(room);
  const awards = room.results?.results.awards ?? [];
  const many = rows.length >= 7;
  const nameOf = (id: string): string =>
    room.results?.players.find((p) => p.id === id)?.name ?? '?';
  const module = room.results ? clientGames[room.results.gameId] : undefined;
  const Finale = module?.Finale;
  const keepBoard = Boolean(Finale && lastView && module?.finale?.(lastView));
  const scoreless = module?.scoreless === true;
  // 7–8 rows sit in two columns of ≤ 4: large rows and a wider board column, or the lower half of
  // the stage is bare (review-loop #32).
  const large = many && rows.length <= 8;
  return (
    // `data-screen` marks the end of a game for the e2e harness: a scoreboard is not a reliable
    // hook, since a game with its own finale (Bingo's board, Lightning's totals) replaces it
    // (review-loop #184).
    <Stage>
      <div className={`${styles.hero} pb-enter`} data-screen="results">
        <BigText level={many || keepBoard ? 'h1' : 'display'} tone="accent">
          {winnerLine(room, scoreless) || t.results.title}
        </BigText>
        {nobodyScored(room) && !scoreless ? (
          <p className="pb-muted">{t.results.nobodyScored}</p>
        ) : null}
      </div>
      {keepBoard && Finale && lastView ? (
        <GameErrorBoundary surface="tv">
          <Suspense fallback={null}>
            <Finale lastView={lastView} room={room} />
          </Suspense>
        </GameErrorBoundary>
      ) : (
        <div
          className={`${styles.columns} ${awards.length === 0 ? styles.single : ''} ${large ? styles.wide : ''}`}
        >
          <Scoreboard rows={rows} noTrophy={nobodyScored(room)} size={large ? 'lg' : 'md'} />
          {awards.length > 0 ? (
            <ul className={styles.awards} aria-label="awards">
              {awards.map((a) => (
                <li key={a.id} className={styles.award}>
                  <span className={styles.awardTitle}>{a.title}</span>
                  <span className={styles.awardWho}>{nameOf(a.playerId)}</span>
                  <span className="pb-muted pb-caption">{a.description}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
      <p className={`pb-muted pb-caption ${awards.length === 0 ? styles.centredHint : ''}`}>
        {t.vip.badge}: {t.results.playAgain} · {t.results.newGame} · {t.results.lobby}
      </p>
    </Stage>
  );
}
