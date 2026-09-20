// TV "result": the winning card grows out of the grid with its author, every other card gets its
// author and vote count, in three beats — cards (0), authors (600 ms), the winner named (1200 ms).
// The headline, the outline and the +1 all carry the result, never colour alone. "final" is the
// drumroll for the engine's results screen: the final board, crown withheld, for 4 s ("done" is
// terminal and never on screen — the engine's results take over at once).
import { useEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import {
  Avatar,
  BigText,
  Confetti,
  Scoreboard,
  Stage,
  boardLandedMs,
  useBeats,
  useSound,
} from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlanksTvView, RevealedCard } from '../server/index';
import { FilledCard, LETTERS } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

/** Authors at 600 ms, the winner at 1200 ms. */
export const RESULT_BEATS_MS = [0, 600, 1200] as const;
/** The final board: the scores land, then the card of the night is dealt beside them. The board
 *  stacks bottom-up, so the leaders are the last rows in; the card waits one short beat past them
 *  (twelve rows ≈ 1.4 s, three ≈ 0.8 s — loop #407; a flat 420 ms had it landing mid-stack) and
 *  the pluck plays on the same beat. `.bestCard` reads the delay from --pb-best-delay. */
export const BEST_CARD_GAP_MS = 120;
export function finalBeatsMs(players: number): readonly number[] {
  return [0, boardLandedMs(players, { dense: players >= 5 }) + BEST_CARD_GAP_MS];
}
const BEAT_BEST = 1;
const BEAT_AUTHORS = 1;
const BEAT_WINNER = 2;
/** I-005 A: the voter chips land this far apart (the CSS `.voterIn` delay uses the same figure). */
const VOTER_STEP_MS = 120;
/** Past this many players the chip strip takes three rows beside the timer. */
const BIG_CHIP_ROOM = 10;

export function winnerLine(
  view: Pick<BlanksTvView, 'revealed' | 'winnerIds' | 'walkover' | 'judgeMode' | 'czar'>,
): string {
  const winners = view.revealed.filter((r) => r.winner);
  if (winners.length === 0) {
    if (view.revealed.length === 0) return 'Nobody played a card';
    if (view.judgeMode === 'czar') {
      const judge = view.czar?.name ?? 'The judge';
      return view.czar?.connected === false
        ? `${judge} dropped — no judge, nobody wins this round`
        : `${judge} never picked — nobody wins this round`;
    }
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

/** Who voted for this card: up to six avatars with names, then "+n" (review-loop #170). */
function Voters({ card }: { card: RevealedCard }): JSX.Element | null {
  if (card.voters.length === 0) return null;
  const shown = card.voters.slice(0, 6);
  const rest = card.voters.length - shown.length;
  return (
    <span className={styles.voters}>
      {shown.map((v, i) => (
        // I-005 A: one at a time, 120 ms apart (--pb-i), with a lock note each (TvResult's effect)
        <span
          key={v.id}
          className={`${styles.voter} ${styles.voterIn}`}
          style={{ '--pb-i': i } as CSSProperties}
        >
          <Avatar avatarId={v.avatarId} size="var(--pb-chip-size)" />
          <span className={styles.authorName}>{v.name}</span>
        </span>
      ))}
      {rest > 0 ? <span className={styles.authorName}>+{rest}</span> : null}
    </span>
  );
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
  const best = view.bestCard;
  const play = useSound();
  const beats = finalBeatsMs(view.standings.length);
  const beat = useBeats(beats);
  useEffect(() => {
    if (beat >= BEAT_BEST && best) play('card');
  }, [beat, best, play]);
  return (
    <Stage center className={styles.table}>
      <p className={styles.kicker}>Final round played</p>
      <BigText level="h1">Final scores</BigText>
      <div className={styles.finalRow}>
        <div className={styles.board}>
          {/* Two columns from five rows and body-size rows from nine: beside the card of the
              night, under a two- or three-row chip strip, a single column of six h2 rows ran
              through the tease line and twelve rows off the stage (review-loop #354). */}
          <Scoreboard
            rows={view.standings}
            noTrophy
            stagger="up"
            dense={view.standings.length >= 5}
            size={view.standings.length >= 9 ? 'sm' : 'md'}
          />
        </div>
        {/* The night's best-liked card, back on the table one last time (review-loop #191). */}
        {best ? (
          <div
            className={styles.bestCard}
            style={{ '--pb-best-delay': `${beats[1]}ms` } as CSSProperties}
          >
            <p className={styles.kicker}>Card of the night</p>
            <FilledCard text={best.black} whites={best.whites} size="mini" winner>
              <span className={styles.author}>
                <Avatar avatarId={best.avatarId} size="var(--pb-chip-size)" />
                <span className={styles.authorName}>{best.name}</span>
                {view.judgeMode === 'czar' ? null : (
                  <span className={styles.voteCount}>
                    {best.votes} {best.votes === 1 ? 'vote' : 'votes'}
                  </span>
                )}
                <span className={styles.bestRound}>round {best.round}</span>
              </span>
            </FilledCard>
          </div>
        ) : null}
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
  // I-005 A: a `lock` note per voter chip as it lands (vote mode; up to six chips are shown) — on
  // the authors beat only: the branch's `beat >= BEAT_AUTHORS` played the run again at the winner.
  const voterCount = Math.min(6, Math.max(0, ...winners.map((w) => w.voters.length)));
  useEffect(() => {
    if (beat !== BEAT_AUTHORS || view.judgeMode !== 'vote' || voterCount === 0) return;
    const ts = Array.from({ length: voterCount }, (_, i) =>
      setTimeout(() => play('lock'), i * VOTER_STEP_MS),
    );
    return () => ts.forEach((t) => clearTimeout(t));
  }, [beat, voterCount, view.judgeMode, play]);
  if (view.phaseId === 'final' || view.phaseId === 'done') return <TvFinal view={view} />;
  // Nobody played: nothing to reveal beat by beat — say so at once, with the card that got no takers.
  if (view.revealed.length === 0) {
    return (
      <Stage center className={styles.table}>
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
  // No winner (the judge dropped or never picked, or nobody voted): there is no name to build up
  // to, so the line lands with the phase instead of leaving the stage empty for the 1.2 s winner
  // beat (loop #768 — an 8 s result that opened on nothing).
  const named = beat >= BEAT_WINNER || winners.length === 0;
  // Three chip rows or nine-plus losers: the stage is short and the pills many — everything a
  // size down (measured live at 838 px of content for a 630 px stage, review-loop #130).
  const dense = view.players.length > BIG_CHIP_ROOM || others.length > 8;
  return (
    <Stage className={styles.table}>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds} · result
        </p>
        {!view.timed ? <span className={styles.progressPill}>Next on the VIP's phone</span> : null}
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
              className={`${styles.stageCard} ${named ? styles.crowned : ''}`}
            >
              <Author card={w} shown={beat >= BEAT_AUTHORS} label={votesLabel(view, w.votes)} />
              {/* Who voted for it, on the same beat the authors land. */}
              {beat >= BEAT_AUTHORS && view.judgeMode === 'vote' ? <Voters card={w} /> : null}
              <span
                className={`${styles.plusOne} ${named && !w.rando ? styles.pop : styles.pending}`}
              >
                +1
              </span>
            </FilledCard>
          ))}
        </div>
      ) : null}
      {/* The winner beat (1200 ms) is the loud one: the card lifts and glows as the `sweep` cue
          sounds, and confetti falls behind it — only for a human win (review-loop #162). */}
      {named && humanWin ? <Confetti pieces={96} /> : null}
      {/* The other cards were all up on the judge stage a moment ago: here only who played
          which letter, and their votes — twelve players fit in two rows of pills. */}
      {others.length > 0 ? (
        <ul
          className={`${styles.losers} ${dense ? styles.losersDense : ''} ${named ? styles.losersDim : ''}`}
          aria-label="the other cards"
        >
          {/* I-005 B: the pills rise one after another, fewest votes first — the runner-up lands
              last, just before the winner is named. */}
          {[...others]
            .sort((a, b) => a.votes - b.votes)
            .map((c, i) => (
              <li
                key={c.slot}
                className={`${styles.loser} ${beat >= BEAT_AUTHORS ? styles.rise : styles.pending}`}
                style={{ '--pb-i': i } as CSSProperties}
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
