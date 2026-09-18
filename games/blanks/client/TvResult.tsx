// TV "result": the winning card grows out of the grid with its author, every other card gets its
// author and vote count, in three beats — cards (0), authors (600 ms), the winner named (1200 ms).
// The headline, the outline and the +1 all carry the result, never colour alone. "final" is the
// drumroll for the engine's results screen: the final board, crown withheld, for 4 s ("done" is
// terminal and never on screen — the engine's results take over at once).
import { useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, BigText, Scoreboard, Stage, useBeats, useSound } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlanksTvView, RevealedCard } from '../server/index';
import { FilledCard, LETTERS } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

/** Authors at 600 ms, the winner at 1200 ms. */
export const RESULT_BEATS_MS = [0, 600, 1200] as const;
const BEAT_AUTHORS = 1;
const BEAT_WINNER = 2;
/** Past this many players the chip strip takes three rows beside the timer. */
const BIG_CHIP_ROOM = 10;

export function winnerLine(
  view: Pick<BlanksTvView, 'revealed' | 'winnerIds' | 'walkover' | 'judgeMode' | 'czar'>,
): string {
  const winners = view.revealed.filter((r) => r.winner);
  if (winners.length === 0) {
    if (view.revealed.length === 0) return 'Nobody played a card';
    if (view.judgeMode === 'czar')
      return `${view.czar?.name ?? 'The judge'} never picked — nobody wins this round`;
    return 'No votes — nobody wins this round';
  }
  const humans = winners.filter((w) => !w.rando).map((w) => w.name);
  // Rando alone is the room's shame; a tie with Rando still names who scored (review-loop #124).
  if (humans.length === 0) return 'Rando wins. Shame on all of you.';
  if (humans.length < winners.length) return `${list(humans)} split it with Rando`;
  const names = humans;
  if (view.walkover) return `Only ${names[0]} played — wins by default`;
  // Two cards, no one else to vote: the round skipped the vote and both take the point.
  if (names.length === 2 && view.revealed.every((r) => r.votes === 0))
    return `Only two cards — ${names[0]} and ${names[1]} split it`;
  if (names.length === 1) return `${names[0]} wins the round!`;
  return `${list(names)} split it`;
}

/** "Ana", "Ana and Ben", "Ana, Ben and Cleo". */
export function list(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** The pill on a card with votes: "3 votes" — or, with a judge, whose pick it was ("1 vote" from a
 *  lone judge read as a poor turnout, review-loop #116). Null when nobody voted for it. */
export function votesLabel(
  view: Pick<BlanksTvView, 'judgeMode' | 'czar'>,
  votes: number,
): string | null {
  if (votes === 0) return null;
  if (view.judgeMode === 'czar') return view.czar ? `${view.czar.name}'s pick` : "Judge's pick";
  return `${votes} ${votes === 1 ? 'vote' : 'votes'}`;
}

function Author({
  card,
  shown,
  label,
}: {
  card: RevealedCard;
  shown: boolean;
  label: string | null;
}): JSX.Element {
  return (
    <span
      className={`${styles.author} ${shown ? styles.rise : styles.pending}`}
      aria-hidden={!shown}
    >
      <Avatar avatarId={card.avatarId} size="var(--pb-chip-size)" />
      <span className={styles.authorName}>{card.name}</span>
      {label ? <span className={styles.voteCount}>{label}</span> : null}
    </span>
  );
}

function TvFinal({ view }: Props): JSX.Element {
  const tied = view.standings.filter((r) => r.rank === 1).length > 1;
  return (
    <Stage center>
      <p className={styles.kicker}>Final round played</p>
      <BigText level="h1">Final scores</BigText>
      <div className={styles.board}>
        <Scoreboard rows={view.standings} noTrophy stagger="up" />
      </div>
      <BigText level="h2" tone="accent">
        {tied ? "It's a tie" : 'And the winner is'}
        <span className={styles.ellipsis} aria-hidden>
          …
        </span>
      </BigText>
    </Stage>
  );
}

export function TvResult({ view }: Props): JSX.Element {
  const play = useSound();
  const beat = useBeats(RESULT_BEATS_MS);
  const winners = view.revealed.filter((r) => r.winner);
  const others = view.revealed.filter((r) => !r.winner);
  const humanWin = winners.some((w) => !w.rando);
  useEffect(() => {
    if (beat >= BEAT_WINNER && humanWin) play('sweep');
  }, [beat, humanWin, play]);
  if (view.phaseId === 'final' || view.phaseId === 'done') return <TvFinal view={view} />;
  // Nobody played: nothing to reveal beat by beat — say so at once, with the card that got no takers.
  if (view.revealed.length === 0) {
    return (
      <Stage center>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds} · result
        </p>
        <BigText level="h1" tone="accent" className="pb-enter">
          {winnerLine(view)}
        </BigText>
        {view.black ? (
          <FilledCard
            text={view.black.text}
            pick={view.black.pick}
            size="hero"
            className={styles.stageCard}
          />
        ) : null}
        <BigText level="h2" tone="muted">
          {view.round < view.rounds ? 'Next card coming up…' : 'That was the last card.'}
        </BigText>
      </Stage>
    );
  }
  const named = beat >= BEAT_WINNER;
  // Three chip rows or nine-plus losers: the stage is short and the pills many — everything a
  // size down (measured live at 838 px of content for a 630 px stage, review-loop #130).
  const dense = view.players.length > BIG_CHIP_ROOM || others.length > 8;
  return (
    <Stage>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds} · result
        </p>
        {!view.timed ? <span className={styles.progressPill}>Next on any phone</span> : null}
      </div>
      <div
        className={`${styles.headline} ${named ? styles.rise : styles.pending}`}
        aria-hidden={!named}
      >
        <BigText level="h1" tone="accent">
          {winnerLine(view)}
        </BigText>
      </div>
      {winners.length > 0 && view.black ? (
        <div
          className={`${styles.winners} ${winners.length > 1 ? styles.winnersSplit : ''} ${winners.length > 2 ? styles.winnersMany : ''}`}
        >
          {/* One winner gets the big card, two share the row; three or more (a big room's
              four-way tie) are thumbnails so the row never wraps under the host bar (#123). */}
          {winners.map((w) => (
            <FilledCard
              key={w.slot}
              text={view.black?.text ?? ''}
              whites={w.whites}
              size={
                winners.length > 2 || (winners.length > 1 && dense)
                  ? 'mini'
                  : winners.length > 1 || dense
                    ? 'grid'
                    : 'medium'
              }
              letter={LETTERS[w.slot]}
              winner={named}
              className={styles.stageCard}
            >
              <Author card={w} shown={beat >= BEAT_AUTHORS} label={votesLabel(view, w.votes)} />
              <span
                className={`${styles.plusOne} ${named && !w.rando ? styles.pop : styles.pending}`}
              >
                +1
              </span>
            </FilledCard>
          ))}
        </div>
      ) : null}
      {/* The other cards were all up on the judge stage a moment ago: here only who played
          which letter, and their votes — twelve players fit in two rows of pills. */}
      {others.length > 0 ? (
        <ul
          className={`${styles.losers} ${dense ? styles.losersDense : ''}`}
          aria-label="the other cards"
        >
          {others.map((c) => (
            <li
              key={c.slot}
              className={`${styles.loser} ${beat >= BEAT_AUTHORS ? styles.rise : styles.pending}`}
              aria-hidden={beat < BEAT_AUTHORS}
            >
              <span className={styles.loserLetter} aria-hidden>
                {LETTERS[c.slot]}
              </span>
              <Avatar avatarId={c.avatarId} size="var(--pb-chip-size)" />
              <span className={styles.authorName}>{c.name}</span>
              {votesLabel(view, c.votes) ? (
                <span className={styles.voteCount}>{votesLabel(view, c.votes)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Stage>
  );
}
