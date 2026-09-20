// Small presentational pieces for the phone: the reveal outcome card and wager button labels.
import type { JSX } from 'react';
import type { WagerOption } from '../server/scoring';
import type { LightningControllerView } from '../server/views';
import styles from './Controller.module.css';

// The amount is the decision, so it leads at h1; the share is the caption. Plain digits, no
// thousands separator (matches every other number in the game).
export function wagerLabel(option: WagerOption, score: number): JSX.Element {
  const caption =
    option.percent === 0
      ? 'nothing at stake'
      : option.percent === 100
        ? 'All in · 100 %'
        : `${option.percent} % of your ${score}`;
  // I-026 A: a stack of chips sized to the share — one disc per 25 %, hollow for nothing.
  const chips = Math.max(1, Math.round(option.percent / 25));
  return (
    <span className={styles.wagerRow}>
      <span className={styles.chips} aria-hidden>
        {Array.from({ length: chips }, (_, i) => (
          <span key={i} className={`${styles.chip} ${option.percent === 0 ? styles.chipEmpty : ''}`} />
        ))}
      </span>
      <span className={styles.amount}>{option.percent === 0 ? '0' : option.amount}</span>
      <span className={styles.pct}>{caption}</span>
    </span>
  );
}

// During the final question the TV hides wagers, so the phone is the only place the stake shows.
// Lives in Screen's sticky footer, persists after lock-in, and Outcome replaces it at reveal.
export function Stake({ amount, live = false }: { amount: number; live?: boolean }): JSX.Element {
  // I-026 C: the bet is live until the answer is locked — the footer breathes meanwhile.
  return (
    <div className={`${styles.stake} ${live && amount > 0 ? styles.stakeLive : ''}`}>
      {amount > 0 ? (
        <>
          🎲 <b>Your bet: {amount}</b> · right +{amount} · wrong −{amount}
        </>
      ) : (
        <>🎲 Nothing riding on this one — play for pride</>
      )}
    </div>
  );
}

function deltaText(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${-delta}`;
  return '0';
}

export interface OutcomeProps {
  view: LightningControllerView;
  /** The streak this player carried into the question (myStreak is already reset at reveal). */
  streakBefore: number;
  /** Seconds left on the clock when this player locked in (null: unknown, e.g. after a reconnect). */
  spare?: number | null;
}

// The reveal is the best moment of the round: verdict as a headline, the delta at display size
// toned by its sign (gold is not for losses), the right answer in words (the ✓ card can sit
// below the fold), streak and running total as a caption.
export function Outcome({ view, streakBefore, spare = null }: OutcomeProps): JSX.Element {
  const outcome = view.outcome;
  if (!outcome) {
    return (
      <p className={styles.footnote} role="status">
        Look at the TV
      </p>
    );
  }
  const final = view.round?.final === true;
  const noPick = view.myPickIndex === null;
  const verdict = outcome.correct
    ? 'Correct!'
    : noPick
      ? final
        ? 'No answer'
        : 'Too slow'
      : 'Wrong';
  const tone = outcome.correct ? styles.good : styles.bad;
  const sign = outcome.delta > 0 ? styles.up : outcome.delta < 0 ? styles.down : styles.zero;
  const answer =
    !outcome.correct && view.correctIndex !== undefined && view.question
      ? `It was ${'ABCDEFGH'[view.correctIndex] ?? view.correctIndex + 1} · ${view.question.choices[view.correctIndex] ?? ''}`
      : null;
  const bet = view.myWagerAmount ?? 0;
  const detail = final
    ? bet === 0
      ? `Wagered nothing · final score ${view.myScore}`
      : `${outcome.correct ? 'Won' : 'Lost'} the wager · you bet ${bet} · final score ${view.myScore}`
    : outcome.correct
      ? `${view.myStreak >= 2 ? `🔥 streak ${view.myStreak} · ` : ''}${spare !== null ? `${spare} s to spare · ` : ''}${view.myScore} points`
      : streakBefore >= 2
        ? `Streak of ${streakBefore} over · ${view.myScore} points`
        : `${view.myScore} points`;
  return (
    <div className={`${styles.outcome} ${tone} ${sign}`} role="status">
      <span className={styles.verdict}>{verdict}</span>
      <span className={styles.delta} aria-label={`${deltaText(outcome.delta)} points`}>
        {deltaText(outcome.delta)}
      </span>
      {answer ? <span className={styles.detail}>{answer}</span> : null}
      <span className={styles.detail}>{detail}</span>
    </div>
  );
}
