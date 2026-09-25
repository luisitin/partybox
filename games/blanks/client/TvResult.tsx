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
  useT,
} from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { FilledCard, LETTERS } from './Cards';
import { Author, Voters } from './TvResultParts';
import { votesLabel, winnerLine } from './resultLines';
import { STRINGS } from './strings';
import { RESULT_BEATS_MS } from './timing';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

/** The final board: the scores land, then the card of the night is dealt beside them. The board
 *  stacks bottom-up, so the leaders are the last rows in; the card waits one short beat past them
 *  (twelve rows ≈ 1.4 s, three ≈ 0.8 s — loop #407; a flat 420 ms had it landing mid-stack) and
 *  the pluck plays on the same beat. `.bestCard` reads the delay from --pb-best-delay. */
export const BEST_CARD_GAP_MS = 120;
export function finalBeatsMs(players: number): readonly number[] {
  return [0, boardLandedMs(players, { dense: players >= 5 }) + BEST_CARD_GAP_MS];
}
const BEAT_BEST = 1;
/** I-019: the final board's totals hold as "—" this long (the tease under them), then count up. */
const HOLD_MS = 1_600;
const BEAT_AUTHORS = 1;
const BEAT_WINNER = 2;
/** I-005 A: the voter chips land this far apart (the CSS `.voterIn` delay uses the same figure). */
const VOTER_STEP_MS = 120;
/** Past this many players the chip strip takes three rows beside the timer. */
const BIG_CHIP_ROOM = 10;

function TvFinal({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const tied = view.standings.filter((r) => r.rank === 1).length > 1;
  const best = view.bestCard;
  const play = useSound();
  const beats = finalBeatsMs(view.standings.length);
  const beat = useBeats(beats);
  useEffect(() => {
    if (beat >= BEAT_BEST && best) play('card');
  }, [beat, best, play]);
  // I-019 B: a run of eight ticks, faster and faster, into the hold's end (the drumroll).
  useEffect(() => {
    const gaps = [260, 220, 190, 160, 130, 110, 90, 70];
    let at = HOLD_MS - gaps.reduce((a, b) => a + b, 0);
    const ts = gaps.map((g) => {
      at += g;
      return setTimeout(() => play('tick'), at);
    });
    ts.push(setTimeout(() => play('fanfare'), HOLD_MS + 600));
    return () => ts.forEach((t) => clearTimeout(t));
  }, [play]);
  return (
    <Stage center className={styles.table}>
      <p className={styles.kicker}>{L('Final round played')}</p>
      <BigText level="h1">{L('Final scores')}</BigText>
      <div className={styles.finalRow}>
        <div className={styles.board}>
          {/* I-146 A: five rows stay in ONE column — a split board draws rank 5 beside rank 1,
              and the final screen is the one place order is the whole message. Two columns from
              seven (the platform's own threshold); body-size rows from nine keep twelve on the
              stage, which is what review-loop #354 was really protecting. */}
          <Scoreboard
            rows={view.standings}
            noTrophy
            holdMs={HOLD_MS}
            stagger="up"
            dense={view.standings.length >= 7}
            size={view.standings.length >= 9 ? 'sm' : 'md'}
          />
        </div>
        {/* The night's best-liked card, back on the table one last time (review-loop #191). */}
        {best ? (
          <div
            className={styles.bestCard}
            style={{ '--pb-best-delay': `${beats[1]}ms` } as CSSProperties}
          >
            <p className={styles.kicker}>{L('Card of the night')}</p>
            <FilledCard text={best.black} whites={best.whites} size="mini" winner>
              <span className={styles.author}>
                <Avatar avatarId={best.avatarId} size="var(--pb-chip-size)" />
                <span className={styles.authorName}>{best.name}</span>
                {view.judgeMode === 'czar' ? null : (
                  <span className={styles.voteCount}>
                    {best.votes === 1 ? L('1 vote') : L('{n} votes', { n: best.votes })}
                  </span>
                )}
                <span className={styles.bestRound}>
                  {L('round {round}', { round: best.round })}
                </span>
              </span>
            </FilledCard>
          </div>
        ) : null}
      </div>
      <BigText level="h2" tone="accent">
        {/* I-019 B: the envelope — its flap turns open as the hold ends and the letter rises out
            (the owner's note: a real envelope, an SVG). */}
        <svg className={styles.envelope} viewBox="0 0 28 20" aria-hidden>
          <rect className={styles.envBack} x="1" y="4" width="26" height="15" rx="2" />
          <rect className={styles.envLetter} x="5" y="6" width="18" height="12" rx="1" />
          <path
            className={styles.envPocket}
            d="M1 6 L14 15 L27 6 V17 a2 2 0 0 1 -2 2 H3 a2 2 0 0 1 -2 -2 Z"
          />
          <path className={styles.envFlap} d="M1 5 H27 L14 14 Z" />
        </svg>
        {tied ? L("It's a tie") : L('And the winner is')}
        <span className={styles.ellipsis} aria-hidden>
          …
        </span>
      </BigText>
    </Stage>
  );
}

export function TvResult({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const vipName = view.players.find((p) => p.id === view.vip)?.name;
  const play = useSound();
  const beat = useBeats(RESULT_BEATS_MS);
  const winners = view.revealed.filter((r) => r.winner);
  const others = view.revealed.filter((r) => !r.winner);
  const humanWin = winners.some((w) => !w.rando);
  useEffect(() => {
    if (beat >= BEAT_WINNER && humanWin) play('sweep');
  }, [beat, humanWin, play]);
  // I-018 B: the deck's win gets its own sting — the sad two-note `bust` where the sweep would be.
  const deckWin = winners.length > 0 && !humanWin;
  useEffect(() => {
    if (beat >= BEAT_WINNER && deckWin) play('bust');
  }, [beat, deckWin, play]);
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
          {L('Round {round} of {rounds} · result', { round: view.round, rounds: view.rounds })}
        </p>
        <BigText level="h1" tone="accent" className="pb-enter">
          {winnerLine(view, L)}
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
          {view.round < view.rounds ? L('Next card coming up…') : L('That was the last card.')}
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
          {L('Round {round} of {rounds} · result', { round: view.round, rounds: view.rounds })}
        </p>
        {/* I-152 B: after a VIP handover "the VIP" is whoever it has just become — name them. */}
        {/* Timed or not, the result waits for the VIP's Next (pacing rule, 2026-09-25). */}
        {view.phaseId === 'result' ? (
          <span className={styles.progressPill}>
            {vipName
              ? L("Next on {name}'s phone", { name: vipName })
              : L("Next on the VIP's phone")}
          </span>
        ) : null}
      </div>
      <div
        className={`${styles.headline} ${named ? styles.rise : styles.pending}`}
        aria-hidden={!named}
      >
        <BigText level="h1" tone="accent">
          {winnerLine(view, L)}
        </BigText>
        {deckWin ? (
          <BigText level="h2" tone="muted">
            {L("Nobody's score moves.")}
          </BigText>
        ) : null}
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
              <Author card={w} shown={beat >= BEAT_AUTHORS} label={votesLabel(view, w.votes, L)} />
              {/* Who voted for it, on the same beat the authors land. */}
              {beat >= BEAT_AUTHORS && view.judgeMode === 'vote' ? <Voters card={w} /> : null}
              {/* I-149 B: judge mode has its own row here — who called the judge's pick. */}
              {beat >= BEAT_AUTHORS && view.calledIt.length > 0 ? (
                <span className={styles.calledIt}>
                  {L('called it:')}{' '}
                  {view.calledIt.map((c) => (
                    <span key={c.name} className={styles.caller}>
                      <Avatar avatarId={c.avatarId} size="var(--pb-chip-size)" />
                      {c.name}
                    </span>
                  ))}
                </span>
              ) : null}
              {/* I-018 C: the deck's point goes to nobody — say so where the +1 would pop. */}
              <span
                className={`${styles.plusOne} ${w.rando ? styles.plusNobody : ''} ${named ? styles.pop : styles.pending}`}
              >
                {w.rando ? L('+0 · nobody') : '+1'}
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
          aria-label={L('the other cards')}
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
                {votesLabel(view, c.votes, L) ? (
                  <span className={styles.voteCount}>{votesLabel(view, c.votes, L)}</span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}
    </Stage>
  );
}
