// Results on the stage: celebrate the winner, show the scoreboard and awards, tell the room
// what the VIP can do next. A game whose last board IS the finale (Lightning's final-wager
// reveal) keeps it up here instead of the scoreboard, until Play again / New game / Home — the
// room stays in `results` until someone acts (owner request 2026-09-15).
import { Suspense } from 'react';
import type { JSX } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { Avatar, BigText, Confetti, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import { GameErrorBoundary } from '../controller/GameErrorBoundary';
import {
  groupAwards,
  joinNames,
  nobodyScored,
  scoreboardRows,
  teamGroups,
  winnerColor,
  winnerLine,
} from '../controller/results-rows';
import { TeamBoards } from '../TeamBoards';
import { useGame } from '../game-loader';
import { t } from '../i18n';
import { serverText } from '../server-text';
import { STRINGS } from './strings';
import styles from './TvResults.module.css';

export interface TvResultsProps {
  room: RoomSnapshot;
  /** The last view the stage showed while playing (null after a reload). */
  lastView?: PushedView<TvView> | null;
}

const AWARD_CARDS = 6;

export function TvResults({ room, lastView = null }: TvResultsProps): JSX.Element {
  const L = useT(STRINGS);
  // An award is the game server's sentence: its own table carries the Spanish.
  const said = (text: string): string => serverText(text, L.lang, room.results?.gameId);
  const rows = scoreboardRows(room);
  // one card per award, everyone who won it named on it (a tie gave each tied player a copy)
  const teams = teamGroups(room);
  const teamColor = winnerColor(room);
  const grouped = groupAwards(room.results?.results.awards ?? []);
  // The award column never runs under the host bar, whatever a game sends: six cards (two columns
  // of three) and a line for the rest (imposter's six-way tie sent seven).
  const awards = grouped.slice(0, AWARD_CARDS);
  const moreAwards = grouped.length - awards.length;
  const many = rows.length >= 7;
  const nameOf = (id: string): string =>
    room.results?.players.find((p) => p.id === id)?.name ?? '?';
  const module = useGame(room.results?.gameId, 'tv').module;
  const Finale = module?.Finale;
  const keepBoard = Boolean(Finale && lastView && module?.finale?.(lastView));
  const scoreless = module?.scoreless === true;
  // a long line (two names, a long one) at display size wrapped and pushed the awards down
  const line = winnerLine(room, scoreless) || t.results.title;
  // 7–8 rows sit in two columns of ≤ 4: large rows and a wider board column, or the lower half of
  // the stage is bare (review-loop #32).
  const large = many && rows.length <= 8;
  // I-025: one clear winner gets a face and a crown on the headline (a tie, a scoreless game or
  // a game nobody scored in stays the plain line).
  const winnerIds = room.results?.results.winnerIds ?? [];
  // ADR-052: a co-op or team game — its line, the winning team's faces, no lone crown.
  const outcome = room.results?.results.outcome;
  // A team's win counts only when the winner is one of its teams (else the line says a draw).
  const celebrate = !outcome
    ? null
    : outcome.kind === 'coop'
      ? outcome.won
      : outcome.teams.some((team) => team.id === outcome.winner);
  const winner =
    !outcome && winnerIds.length === 1 && !nobodyScored(room) && !scoreless
      ? (room.results?.players.find((p) => p.id === winnerIds[0]) ?? null)
      : null;
  // I-037 A: a real tie shares the crown — the tied faces together beside the line.
  const tied =
    // a team's win crowns its faces even on a 0–0 board; the old tie still needs a score
    (outcome
      ? outcome.kind === 'teams' && celebrate
      : winnerIds.length > 1 && !nobodyScored(room)) && !scoreless
      ? (room.results?.players.filter((p) => winnerIds.includes(p.id)) ?? []).slice(0, 4)
      : [];
  const crowned = winner !== null || tied.length > 0;
  return (
    // `data-screen` marks the end of a game for the e2e harness: a scoreboard is not a reliable
    // hook, since a game with its own finale (Bingo's board, Lightning's totals) replaces it
    // (review-loop #184).
    <Stage>
      <div
        className={`${styles.hero} ${crowned ? styles.crowned : 'pb-enter'} ${tied.length > 0 ? styles.tiedHero : ''}`}
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
        {/* three or more tied names take the h1 size: at display size a Spanish tie wrapped to
            two lines and pushed the last award under the host bar */}
        <BigText
          level={
            many || keepBoard || tied.length >= 3 || line.length > 24 || teams ? 'h1' : 'display'
          }
          tone="accent"
        >
          {/* the winning team's colour on its headline (the mark alone was headline yellow) */}
          <span style={teamColor ? { color: teamColor } : undefined}>{line}</span>
        </BigText>
        {/* a plain game only: under a team draw or a co-op result it read as nonsense (secret-hitler 53d0d5) */}
        {nobodyScored(room) && !scoreless && !outcome ? (
          <p className="pb-muted">{t.results.nobodyScored}</p>
        ) : null}
      </div>
      {/* I-025 B: confetti for a person — a gentle sixteen pieces when a bot takes it. */}
      {winner ? <Confetti pieces={winner.bot ? 16 : 48} /> : null}
      {/* I-037 A: a tie gets one shared, smaller sprinkle. */}
      {tied.length > 0 && !outcome ? <Confetti pieces={12} /> : null}
      {/* ADR-052: a mission complete or a team's win is a full celebration; a loss or a draw, none. */}
      {celebrate ? <Confetti pieces={48} /> : null}
      {keepBoard && Finale && lastView ? (
        <GameErrorBoundary surface="tv">
          {/* I-025 C: a photo finish — the board dims for a beat as the winner is named. */}
          <Suspense fallback={null}>
            <div className={crowned ? styles.photoFinish : undefined}>
              <Finale lastView={lastView} room={room} />
            </div>
          </Suspense>
        </GameErrorBoundary>
      ) : (
        <div
          className={`${styles.columns} ${awards.length === 0 ? styles.single : ''} ${large ? styles.wide : ''} ${crowned ? styles.photoFinish : ''}`}
        >
          {/* ADR-052: a team game's board is grouped by team, the winners first */}
          {teams ? (
            // body-size rows: two team headers on top of the board ran it under the host bar
            <TeamBoards groups={teams} size="sm" wonLabel={t.results.teamWonTag} />
          ) : (
            <Scoreboard
              rows={rows}
              // a co-op board has no places: the group won or lost together (ADR-052)
              noTrophy={nobodyScored(room) || outcome?.kind === 'coop'}
              noRanks={nobodyScored(room) || outcome?.kind === 'coop'}
              size={large ? 'lg' : 'md'}
            />
          )}
          {awards.length > 0 ? (
            <ul className={styles.awards} aria-label={L('awards')}>
              {awards.map((a) => (
                <li key={`${a.id}|${a.title}`} className={styles.award}>
                  <span className={styles.awardTitle}>{said(a.title)}</span>
                  <span className={styles.awardWho}>{joinNames(a.playerIds.map(nameOf))}</span>
                  {a.description !== null ? (
                    <span className="pb-muted pb-caption">{said(a.description)}</span>
                  ) : (
                    a.perPlayer.map((x) => (
                      <span key={x.playerId} className="pb-muted pb-caption">
                        {nameOf(x.playerId)}: {said(x.description)}
                      </span>
                    ))
                  )}
                </li>
              ))}
              {moreAwards > 0 ? (
                <li className={`${styles.award} ${styles.moreAwards}`}>
                  {t.results.moreAwards(moreAwards)}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      )}
      {/* I-034 A: the room knows the game was kept. (The VIP's choices are the host bar's buttons
          right under it; a line repeating them ran behind those buttons — tune-in's play-test.) */}
      {room.recording ? (
        <p className={`pb-muted pb-caption ${awards.length === 0 ? styles.centredHint : ''}`}>
          {L('📼 Recap saved on the host PC')}
        </p>
      ) : null}
    </Stage>
  );
}
