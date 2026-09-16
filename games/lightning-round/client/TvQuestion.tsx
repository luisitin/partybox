// TV: the question, its four lettered choices in a 2×2 grid, and — in reveal — the correct one
// marked with ✓ (never colour-only) plus one row per player with verdict, points and streak.
import type { CSSProperties, JSX } from 'react';
import { Avatar, BigText } from '@partybox/game-sdk/ui';
import type { QuestionView, RevealRow, RoundView } from '../server/views';
import styles from './Tv.module.css';

const LETTERS = ['A', 'B', 'C', 'D'];

export function roundLabel(round: RoundView | null): string {
  if (round === null) return '';
  return round.final ? 'Final question' : `Question ${round.number} of ${round.total}`;
}

export function RoundHeader({
  round,
  question,
}: {
  round: RoundView | null;
  question: QuestionView | null;
}): JSX.Element {
  return (
    <div className={styles.header}>
      <span className={`${styles.kicker} ${round?.final ? styles.final : ''}`}>
        {roundLabel(round)}
      </span>
      {question ? (
        <span>
          {question.categoryLabel} · {question.difficulty}
        </span>
      ) : null}
    </div>
  );
}

export function ChoiceBoard({
  question,
  correctIndex,
}: {
  question: QuestionView;
  /** Undefined until the reveal. */
  correctIndex?: number;
}): JSX.Element {
  const revealed = correctIndex !== undefined;
  return (
    <div className={styles.grid} role="list" aria-label="choices">
      {question.choices.map((text, index) => {
        const isCorrect = revealed && index === correctIndex;
        const classes = [
          styles.choice,
          isCorrect ? styles.correct : '',
          revealed && !isCorrect ? styles.dim : '',
        ].join(' ');
        return (
          <div
            key={index}
            role="listitem"
            className={classes}
            style={{ '--i': index } as CSSProperties}
          >
            <span className={styles.letter} aria-hidden>
              {LETTERS[index]}
            </span>
            <span>{text}</span>
            <span className={styles.mark} aria-hidden>
              {isCorrect ? '✓' : ''}
            </span>
            {isCorrect ? <span className="pb-visually-hidden">correct answer</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/** Reveal: the one fact the room wants — "it was A · Neil Armstrong" — as the biggest text on stage. */
export function AnswerCard({
  question,
  correctIndex,
  hidden,
}: {
  question: QuestionView;
  correctIndex: number;
  /** Held back (invisible, space reserved) until a choreographed beat; the pop plays on unhide. */
  hidden?: boolean;
}): JSX.Element {
  return (
    <div
      className={`${styles.choice} ${styles.answer} ${hidden ? styles.answerHidden : ''}`}
      role="status"
    >
      <span className={styles.letter} aria-hidden>
        {LETTERS[correctIndex]}
      </span>
      <span>{question.choices[correctIndex]}</span>
      <span className={styles.mark} aria-hidden>
        ✓
      </span>
      <span className="pb-visually-hidden">correct answer: {LETTERS[correctIndex]}</span>
    </div>
  );
}

export function TvQuestion({
  round,
  question,
  answeredCount,
  totalCount,
}: {
  round: RoundView | null;
  question: QuestionView | null;
  answeredCount: number;
  totalCount: number;
}): JSX.Element {
  return (
    <>
      <RoundHeader round={round} question={question} />
      <BigText level="h1">{question?.text ?? '…'}</BigText>
      {question ? <ChoiceBoard question={question} /> : null}
      <p className={styles.count} role="status">
        {answeredCount} / {totalCount} answered
      </p>
    </>
  );
}

export function verdictOf(row: RevealRow): { glyph: string; label: string } {
  if (row.correct) return { glyph: '✓', label: 'correct' };
  if (row.pickIndex === null) return { glyph: '–', label: 'no answer' };
  return { glyph: '✗', label: 'wrong' };
}

export function deltaText(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${-delta}`;
  return '+0';
}

export function RevealRows({ rows, final }: { rows: RevealRow[]; final: boolean }): JSX.Element {
  return (
    <ol className={styles.rows} aria-label="results">
      {rows.map((row) => {
        const verdict = verdictOf(row);
        const deltaClass = row.delta > 0 ? styles.deltaUp : row.delta < 0 ? styles.deltaDown : '';
        return (
          <li
            key={row.playerId}
            className={`${styles.row} ${row.correct ? styles.rowCorrect : ''}`}
          >
            <Avatar avatarId={row.avatarId} size={48} dim={!row.connected} />
            <span className={styles.name}>{row.name}</span>
            {final ? <span className={styles.wager}>bet {row.wagerAmount ?? 0}</span> : null}
            {!final && row.streak >= 2 ? (
              <span className={styles.streak}>🔥 {row.streak}</span>
            ) : null}
            <span
              className={`${styles.verdict} ${row.correct ? styles.verdictOk : styles.verdictNo}`}
              aria-label={verdict.label}
            >
              {verdict.glyph}
            </span>
            <span className={`${styles.delta} ${deltaClass}`}>{deltaText(row.delta)}</span>
          </li>
        );
      })}
    </ol>
  );
}
