// Small presentational pieces for the phone: the reveal outcome card and wager button labels.
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { WagerOption } from '../server/scoring';
import type { LightningControllerView, RevealRow } from '../server/views';
import styles from './Controller.module.css';
import { pointsText } from './labels';
import { STRINGS } from './strings';

// The amount is the decision, so it leads at h1; the share is the caption. Plain digits, no
// thousands separator (matches every other number in the game).
export function wagerLabel(option: WagerOption, L: Translator): JSX.Element {
  const caption =
    option.percent === 0
      ? L('nothing at stake')
      : option.percent === 100
        ? L('All in') // I-550 (the owner's note): the four chips already say 100 %
        : `${option.percent} %`; // I-550 (the owner's note): the prompt already says "of your N"
  return (
    <span className={styles.wagerRow}>
      <Chips percent={option.percent} />
      <span className={styles.amount}>{option.percent === 0 ? '0' : option.amount}</span>
      <span className={styles.pct}>{caption}</span>
    </span>
  );
}

/** I-026 A: a stack of chips sized to the share — one disc per 25 %, hollow for nothing. */
export function Chips({ percent }: { percent: number }): JSX.Element {
  const chips = Math.max(1, Math.round(percent / 25));
  return (
    <span className={styles.chips} aria-hidden>
      {Array.from({ length: chips }, (_, i) => (
        <span key={i} className={`${styles.chip} ${percent === 0 ? styles.chipEmpty : ''}`} />
      ))}
    </span>
  );
}

// During the final question the TV hides wagers, so the phone is the only place the stake shows.
// Lives in Screen's sticky footer, persists after lock-in, and Outcome replaces it at reveal.
export function Stake({ amount, live = false }: { amount: number; live?: boolean }): JSX.Element {
  const L = useT(STRINGS);
  // I-026 C: the bet is live until the answer is locked — the footer breathes meanwhile.
  return (
    <div className={`${styles.stake} ${live && amount > 0 ? styles.stakeLive : ''}`}>
      {amount > 0 ? (
        <>
          🎲 <b>{L('Your bet: {amount}', { amount })}</b> ·{' '}
          {L('right +{amount} · wrong −{amount}', { amount })}
        </>
      ) : (
        <>🎲 {L('Nothing riding on this one — play for pride')}</>
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

/** The caption under the delta: the wager's fate on the final, else streak · speed · total. */
function detailLine(
  view: LightningControllerView,
  correct: boolean,
  streakBefore: number,
  spare: number | null,
  L: Translator,
): string {
  const score = view.myScore;
  if (view.round?.final === true) {
    const bet = view.myWagerAmount ?? 0;
    if (bet === 0) return L('Wagered nothing · final score {score}', { score });
    return correct
      ? L('Won the wager · you bet {bet} · final score {score}', { bet, score })
      : L('Lost the wager · you bet {bet} · final score {score}', { bet, score });
  }
  const parts: string[] = [];
  if (correct) {
    if (view.myStreak >= 2) parts.push(L('🔥 streak {streak}', { streak: view.myStreak }));
    if (spare !== null) parts.push(L('{seconds} s to spare', { seconds: spare }));
  } else if (streakBefore >= 2) {
    parts.push(L('Streak of {streak} over', { streak: streakBefore }));
  }
  parts.push(pointsText(score, L));
  return parts.join(' · ');
}

// The reveal is the best moment of the round: verdict as a headline, the delta at display size
// toned by its sign (gold is not for losses), the right answer in words (the ✓ card can sit
// below the fold), streak and running total as a caption.
export function Outcome({ view, streakBefore, spare = null }: OutcomeProps): JSX.Element {
  const L = useT(STRINGS);
  const outcome = view.outcome;
  if (!outcome) {
    return (
      <p className={styles.footnote} role="status">
        {view.phoneOnly ? L('The answer is coming…') : L('Look at the TV')}
      </p>
    );
  }
  const final = view.round?.final === true;
  const noPick = view.myPickIndex === null;
  const verdict = outcome.correct
    ? L('Correct!')
    : noPick
      ? final
        ? L('No answer')
        : L('Too slow')
      : L('Wrong');
  const tone = outcome.correct ? styles.good : styles.bad;
  const sign = outcome.delta > 0 ? styles.up : outcome.delta < 0 ? styles.down : styles.zero;
  const answer =
    !outcome.correct && view.correctIndex !== undefined && view.question
      ? L('It was {letter} · {answer}', {
          letter: 'ABCDEFGH'[view.correctIndex] ?? view.correctIndex + 1,
          answer: view.question.choices[view.correctIndex] ?? '',
        })
      : null;
  const detail = detailLine(view, outcome.correct, streakBefore, spare, L);
  return (
    <div className={`${styles.outcome} ${tone} ${sign}`} role="status">
      <span className={styles.verdict}>{verdict}</span>
      <span className={styles.delta} aria-label={L('{n} points', { n: deltaText(outcome.delta) })}>
        {deltaText(outcome.delta)}
      </span>
      {answer ? <span className={styles.detail}>{answer}</span> : null}
      <span className={styles.detail}>{detail}</span>
    </div>
  );
}

/** A "phone only" room reads the TV's reveal on the phone: who got it, the points, the totals. */
export function RoomRows({ rows }: { rows: RevealRow[] }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <ol className={styles.roomRows} aria-label={L("everyone's results")}>
      {rows.map((row) => (
        <li
          key={row.playerId}
          className={`${styles.roomRow} ${row.correct ? styles.roomRowOk : ''}`}
        >
          <Avatar avatarId={row.avatarId} size={24} dim={!row.connected} />
          <span className={styles.roomName}>{row.name}</span>
          <span className={styles.roomVerdict} aria-hidden>
            {row.correct ? '✓' : row.pickIndex !== null ? '✗' : '—'}
          </span>
          <span className={styles.roomDelta}>{deltaText(row.delta)}</span>
          <span className={styles.roomScore}>{row.score}</span>
        </li>
      ))}
    </ol>
  );
}
