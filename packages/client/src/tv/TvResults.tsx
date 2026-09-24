// Results on the stage: celebrate the winner, show the scoreboard and awards, tell the room
// what the VIP can do next. A game whose last board IS the finale (Lightning's final-wager
// reveal) keeps it up here instead of the scoreboard, until Play again / New game / Home — the
// room stays in `results` until someone acts (owner request 2026-09-15).
import { Suspense } from 'react';
import type { JSX } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { Avatar, BigText, Confetti, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import { GameErrorBoundary } from '../controller/GameErrorBoundary';
import { nobodyScored, scoreboardRows, winnerLine } from '../controller/results-rows';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import { serverText } from '../server-text';
import { STRINGS } from './strings';
import styles from './TvResults.module.css';

export interface TvResultsProps {
  room: RoomSnapshot;
  /** The last view the stage showed while playing (null after a reload). */
  lastView?: PushedView<TvView> | null;
}

export function TvResults({ room, lastView = null }: TvResultsProps): JSX.Element {
  const L = useT(STRINGS);
  // An award is the game server's sentence: its own table carries the Spanish.
  const said = (text: string): string => serverText(text, L.lang, room.results?.gameId);
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
  // I-025: one clear winner gets a face and a crown on the headline (a tie, a scoreless game or
  // a game nobody scored in stays the plain line).
  const winnerIds = room.results?.results.winnerIds ?? [];
  const winner =
    winnerIds.length === 1 && !nobodyScored(room) && !scoreless
      ? (room.results?.players.find((p) => p.id === winnerIds[0]) ?? null)
      : null;
  // I-037 A: a real tie shares the crown — the tied faces together beside the line.
  const tied =
    winnerIds.length > 1 && !nobodyScored(room) && !scoreless
      ? (room.results?.players.filter((p) => winnerIds.includes(p.id)) ?? []).slice(0, 4)
      : [];
  const crowned = winner !== null || tied.length > 0;
  // I-576 A: a game's awards, beside the scoreboard — or in one row under the game's own Finale
  // (they used to vanish whenever a game had a Finale: Broken Pencil's "Unbroken", Lightning's)
  const awardList = (row: boolean): JSX.Element | null =>
    awards.length > 0 ? (
      <ul className={`${styles.awards} ${row ? styles.awardsRow : ''}`} aria-label={L('awards')}>
        {awards.map((a) => (
          <li key={a.id} className={styles.award}>
            <span className={styles.awardTitle}>{said(a.title)}</span>
            <span className={styles.awardWho}>{nameOf(a.playerId)}</span>
            <span className="pb-muted pb-caption">{said(a.description)}</span>
          </li>
        ))}
      </ul>
    ) : null;
  return (
    // `data-screen` marks the end of a game for the e2e harness: a scoreboard is not a reliable
    // hook, since a game with its own finale (Bingo's board, Lightning's totals) replaces it
    // (review-loop #184).
    <Stage>
      <div
        className={`${styles.hero} ${crowned ? styles.crowned : 'pb-enter'}`}
        data-screen="results"
      >
        {winner ? <Avatar avatarId={winner.avatarId} size={72} /> : null}
        {tied.length > 0 ? (
          <span className={styles.tiedFaces} aria-hidden>
            {tied.map((p) => (
              <span key={p.id} className={styles.tiedFace}>
                <Avatar avatarId={p.avatarId} size={56} />
              </span>
            ))}
          </span>
        ) : null}
        <BigText level={many || keepBoard ? 'h1' : 'display'} tone="accent">
          {winnerLine(room, scoreless) || t.results.title}
        </BigText>
        {nobodyScored(room) && !scoreless ? (
          <p className="pb-muted">{t.results.nobodyScored}</p>
        ) : null}
      </div>
      {/* I-025 B: confetti for a person — a gentle sixteen pieces when a bot takes it. */}
      {winner ? <Confetti pieces={winner.bot ? 16 : 48} /> : null}
      {/* I-037 A: a tie gets one shared, smaller sprinkle. */}
      {tied.length > 0 ? <Confetti pieces={12} /> : null}
      {keepBoard && Finale && lastView ? (
        <GameErrorBoundary surface="tv">
          {/* I-025 C: a photo finish — the board dims for a beat as the winner is named. */}
          <Suspense fallback={null}>
            <div className={crowned ? styles.photoFinish : undefined}>
              <Finale lastView={lastView} room={room} />
            </div>
          </Suspense>
          {awardList(true)}
        </GameErrorBoundary>
      ) : (
        <div
          className={`${styles.columns} ${awards.length === 0 ? styles.single : ''} ${large ? styles.wide : ''} ${crowned ? styles.photoFinish : ''}`}
        >
          <Scoreboard
            rows={rows}
            noTrophy={nobodyScored(room)}
            noRanks={nobodyScored(room)}
            size={large ? 'lg' : 'md'}
          />
          {awardList(false)}
        </div>
      )}
      <p className={`pb-muted pb-caption ${awards.length === 0 ? styles.centredHint : ''}`}>
        {t.vip.badge}: {t.results.playAgain} · {t.results.newGame} · {t.results.lobby}
        {/* I-034 A: the room knows the game was kept. */}
        {room.recording ? <> · {L('📼 Recap saved on the host PC')}</> : null}
      </p>
    </Stage>
  );
}
