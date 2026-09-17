// TV "result": the winning card grows out of the grid with its author, every other card gets its
// author and vote count, in three beats — cards (0), authors (600 ms), the winner named (1200 ms).
// The headline, the outline and the +1 all carry the result, never colour alone. "done" is the
// drumroll for the engine's results screen: the final board, crown withheld.
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

export function winnerLine(
  view: Pick<BlanksTvView, 'revealed' | 'winnerIds' | 'walkover'>,
): string {
  const winners = view.revealed.filter((r) => r.winner);
  if (winners.length === 0)
    return view.revealed.length === 0
      ? 'Nobody played a card'
      : 'No votes — nobody wins this round';
  if (winners.some((w) => w.rando)) return 'Rando wins. Shame on all of you.';
  const names = winners.map((w) => w.name);
  if (view.walkover) return `Only ${names[0]} played — wins by default`;
  if (names.length === 1) return `${names[0]} wins the round!`;
  if (names.length === 2) return `${names[0]} and ${names[1]} split it`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} split it`;
}

function Author({ card, shown }: { card: RevealedCard; shown: boolean }): JSX.Element {
  return (
    <span
      className={`${styles.author} ${shown ? styles.rise : styles.pending}`}
      aria-hidden={!shown}
    >
      <Avatar avatarId={card.avatarId} size="var(--pb-chip-size)" />
      <span className={styles.authorName}>{card.name}</span>
      {card.votes > 0 ? (
        <span className={styles.voteCount}>
          {card.votes} {card.votes === 1 ? 'vote' : 'votes'}
        </span>
      ) : null}
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
  if (view.phaseId === 'done') return <TvFinal view={view} />;
  const named = beat >= BEAT_WINNER;
  return (
    <Stage>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds} · result
        </p>
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
        <div className={`${styles.winners} ${winners.length > 1 ? styles.winnersSplit : ''}`}>
          {winners.map((w) => (
            <FilledCard
              key={w.slot}
              text={view.black?.text ?? ''}
              whites={w.whites}
              size={winners.length > 1 || others.length > 4 ? 'grid' : 'hero'}
              letter={LETTERS[w.slot]}
              winner={named}
              className={styles.stageCard}
            >
              <Author card={w} shown={beat >= BEAT_AUTHORS} />
              <span
                className={`${styles.plusOne} ${named && !w.rando ? styles.pop : styles.pending}`}
              >
                +1
              </span>
            </FilledCard>
          ))}
        </div>
      ) : null}
      {others.length > 0 ? (
        <ul className={styles.resultStrip} aria-label="the other cards">
          {others.map((c) => (
            <li key={c.slot}>
              <FilledCard
                text={view.black?.text ?? ''}
                whites={c.whites}
                size="mini"
                letter={LETTERS[c.slot]}
              >
                <Author card={c} shown={beat >= BEAT_AUTHORS} />
              </FilledCard>
            </li>
          ))}
        </ul>
      ) : null}
    </Stage>
  );
}
