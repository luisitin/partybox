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
  return (
    <span className={styles.wagerRow}>
      <span className={styles.amount}>{option.percent === 0 ? '0' : option.amount}</span>
      <span className={styles.pct}>{caption}</span>
    </span>
  );
}

// During the final question the TV hides wagers, so the phone is the only place the stake shows.
// Lives in Screen's sticky footer, persists after lock-in, and Outcome replaces it at reveal.
export function Stake({ amount }: { amount: number }): JSX.Element {
  return (
    <div className={styles.stake}>
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
  return '+0';
}

// The reveal is the best moment of the round: verdict as a headline, the delta at display size,
// the streak and running total as a caption — not an 18 px footer line.
export function Outcome({ view }: { view: LightningControllerView }): JSX.Element {
  const outcome = view.outcome;
  if (!outcome) {
    return (
      <p className={styles.footnote} role="status">
        Look at the TV
      </p>
    );
  }
  const verdict = outcome.correct ? 'Correct!' : view.myPickIndex === null ? 'No answer' : 'Wrong';
  const tone = outcome.correct ? styles.good : styles.bad;
  const detail = view.round?.final
    ? `Final score ${view.myScore}`
    : outcome.correct
      ? `${view.myStreak >= 2 ? `🔥 streak ${view.myStreak} · ` : ''}${view.myScore} points`
      : `streak reset · ${view.myScore} points`;
  return (
    <div className={`${styles.outcome} ${tone}`} role="status">
      <span className={styles.verdict}>{verdict}</span>
      <span className={styles.delta} aria-label={`${deltaText(outcome.delta)} points`}>
        {deltaText(outcome.delta)}
      </span>
      <span className={styles.detail}>{detail}</span>
    </div>
  );
}
