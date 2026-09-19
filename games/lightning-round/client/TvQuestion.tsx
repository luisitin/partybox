// TV: the question, its four lettered choices in a 2×2 grid, and — in reveal — the correct one
// marked with ✓ (never colour-only) plus one row per player with verdict, points and streak.
import type { CSSProperties, JSX } from 'react';
import { Avatar, BigText } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
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
          {question.categoryLabel} · {question.subcategoryLabel} · {question.difficulty}
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

/** "Sam", "Sam and Priya", "Sam, Priya and Kenji". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Who the room is waiting for: connected players who have not locked in. Not derived from
 * m − n — the count includes picks from players who have since dropped.
 */
export function holdoutsOf(players: ViewPlayer[]): string[] {
  return players.filter((p) => p.connected && p.status === 'active').map((p) => p.name);
}

/** "3 / 6 locked in · waiting for Sam and Priya" — the number pops on every change. */
export function CountLine({
  answeredCount,
  totalCount,
  players,
  verb,
}: {
  answeredCount: number;
  totalCount: number;
  players: ViewPlayer[];
  verb: string;
}): JSX.Element {
  const holdouts = holdoutsOf(players);
  return (
    <p className={styles.count} role="status">
      <span key={answeredCount} className={styles.countNum}>
        {answeredCount} / {totalCount}
      </span>{' '}
      {verb}
      {holdouts.length >= 1 && holdouts.length <= 3 ? (
        <span className={styles.holdouts}> · waiting for {joinNames(holdouts)}</span>
      ) : null}
    </p>
  );
}

export function TvQuestion({
  round,
  question,
  answeredCount,
  totalCount,
  players,
}: {
  round: RoundView | null;
  question: QuestionView | null;
  answeredCount: number;
  totalCount: number;
  players: ViewPlayer[];
}): JSX.Element {
  return (
    <>
      <RoundHeader round={round} question={question} />
      <BigText level="h1">{question?.text ?? '…'}</BigText>
      {question ? <ChoiceBoard question={question} /> : null}
      <CountLine
        answeredCount={answeredCount}
        totalCount={totalCount}
        players={players}
        verb="locked in"
      />
    </>
  );
}

/** Verdict glyph with the pick folded in — "A✓", "D✗" or "–" — so the room sees who picked what. */
export function verdictOf(row: RevealRow): { glyph: string; label: string } {
  if (row.pickIndex === null) return { glyph: '–', label: 'no answer' };
  const letter = LETTERS[row.pickIndex] ?? '';
  if (row.correct) return { glyph: `${letter}✓`, label: `picked ${letter}, correct` };
  return { glyph: `${letter}✗`, label: `picked ${letter}, wrong` };
}

export function deltaText(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${-delta}`;
  return '0';
}

/** Explicit columns by player count (never auto-fit): every count stays within four 60 px rows. */
export function rowsClass(count: number): string {
  return (count <= 8 ? styles.rows2 : count <= 12 ? styles.rows3 : styles.rows4) ?? '';
}

export function RevealRows({ rows }: { rows: RevealRow[] }): JSX.Element {
  const wide = rows.length <= 8;
  const crowned = rows.length <= 12;
  const top = Math.max(0, ...rows.map((r) => r.score));
  return (
    <ol className={`${styles.rows} ${rowsClass(rows.length)}`} aria-label="results">
      {rows.map((row, index) => {
        const verdict = verdictOf(row);
        const quiet = row.delta === 0;
        const deltaClass = row.delta > 0 ? styles.deltaUp : row.delta < 0 ? styles.deltaDown : '';
        const verdictClass = row.correct
          ? styles.verdictOk
          : row.pickIndex !== null
            ? styles.verdictNo
            : '';
        return (
          <li
            key={row.playerId}
            className={`${styles.row} ${row.correct ? styles.rowCorrect : ''} ${quiet ? styles.rowQuiet : ''}`}
            style={{ '--i': index } as CSSProperties}
          >
            <Avatar avatarId={row.avatarId} size={48} dim={!row.connected} />
            {crowned && top > 0 && row.score === top ? (
              <span className={styles.crown} aria-label="leader">
                👑
              </span>
            ) : null}
            <span className={styles.name}>{row.name}</span>
            {row.streak >= 2 ? (
              <span
                className={`${styles.streak} ${row.streak >= 3 ? styles.streakHot : ''}`}
                aria-label={`streak ${row.streak}`}
              >
                🔥{row.streak}
              </span>
            ) : null}
            <span className={`${styles.verdict} ${verdictClass}`} aria-label={verdict.label}>
              {verdict.glyph}
            </span>
            <span className={`${styles.delta} ${deltaClass}`}>{deltaText(row.delta)}</span>
            {wide ? <span className={styles.score}>{row.score}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
