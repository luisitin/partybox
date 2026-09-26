// TV: the final-wager reveal — the biggest beat of the game, so it is paced instead of dropped in
// one frame. Bets first (smallest wager first, so the biggest bet flips last), then the answer,
// then verdict + delta per row, then the totals and the leader's outline, with one cue (jackpot
// if anyone won their bet, bust if nobody did). Under reduced motion every beat is 0 ms and the
// stage shows settled. Mount with `key={round.number}` so a re-pushed view never restarts it.
import { useEffect, useRef } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, useBeats, useSound, useT } from '@partybox/game-sdk/ui';
import type { QuestionView, RevealRow } from '../server/views';
import { topicLine } from './labels';
import { STRINGS } from './strings';
import { AnswerCard, deltaText, rowsClass, verdictOf } from './TvQuestion';
import styles from './Tv.module.css';

const T_ANSWER_MS = 900;
const T_VERDICT_MS = 1200;
const T_TOTALS_GAP_MS = 600;
const STEP_MAX_MS = 300;
const STEP_SPAN_MS = 1500;
/** `--pb-motion-slow` (600 ms) is the unit the per-row stagger is expressed in, so it scales to 0. */
const SLOW_MS = 600;

/** I-542: the settled board — highest score first. */
function byScore(a: RevealRow, b: RevealRow): number {
  return b.score - a.score || a.playerId.localeCompare(b.playerId);
}

function byWager(a: RevealRow, b: RevealRow): number {
  return (
    (a.wagerAmount ?? 0) - (b.wagerAmount ?? 0) ||
    a.score - a.delta - (b.score - b.delta) ||
    a.playerId.localeCompare(b.playerId)
  );
}

export function FinalReveal({
  question,
  correctIndex,
  rows: unsorted,
  settled = false,
}: {
  question: QuestionView;
  correctIndex: number;
  rows: RevealRow[];
  /** The results stage: everything shown at once, no cue (the reveal already played). */
  settled?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  // I-542 A: the live reveal deals by bet (the biggest last); the results stage keeps rank order
  const ranked = settled;
  const rows = [...unsorted].sort(ranked ? byScore : byWager);
  const n = rows.length;
  const stepMs = n > 1 ? Math.min(STEP_MAX_MS, STEP_SPAN_MS / (n - 1)) : 0;
  const lastMs = T_VERDICT_MS + stepMs * (n - 1);
  // The schedule is fixed for this mount: the row count cannot change inside one reveal.
  const beats = useBeats([0, T_ANSWER_MS, T_VERDICT_MS, lastMs, lastMs + T_TOTALS_GAP_MS]);
  const beat = settled ? 4 : beats;
  const answered = beat >= 1;
  const judged = beat >= 2;
  const totals = beat >= 4;

  const play = useSound();
  // Claiming the phase on mount keeps the shell's mapped reveal sting out of the final: its own
  // cue is the jackpot/bust at the last row (child effects run before the shell's).
  useEffect(() => {
    if (!settled) play('silence');
  }, [play, settled]);
  const jackpot = rows.some((r) => r.delta > 0);
  const cued = useRef(settled);
  useEffect(() => {
    if (beat < 3 || cued.current) return;
    cued.current = true;
    play(jackpot ? 'jackpot' : 'bust');
  }, [beat, jackpot, play]);

  const top = Math.max(0, ...rows.map((r) => r.score));
  const listStyle = {
    '--pb-final-step': `calc(var(--pb-motion-slow) * ${(stepMs / SLOW_MS).toFixed(4)})`,
  } as CSSProperties;
  return (
    <>
      <div className={styles.header}>
        <span className={`${styles.kicker} ${styles.final}`}>
          {L('Final question · the bets are in')}
        </span>
        <span>{topicLine(question, L)}</span>
      </div>
      <p className={styles.asked}>{question.text}</p>
      <AnswerCard question={question} correctIndex={correctIndex} hidden={!answered} />
      <ol
        // Three or four bet rows (two lines each, under the question and the answer) ran past the
        // host bar in one column: they take two columns, like five to eight do.
        key={ranked ? 'ranked' : 'dealt'} /* I-542: the rank order deals in fresh */
        className={`${styles.rows} ${rowsClass(n > 2 ? Math.max(n, 5) : n)} ${styles.rowsFinal} ${ranked ? styles.rowsRanked : ''}`}
        style={listStyle}
        aria-label={L('results')}
      >
        {rows.map((row, index) => {
          const verdict = verdictOf(row, L);
          const bet = row.wagerAmount ?? 0;
          const deltaClass =
            row.delta > 0 ? styles.deltaUp : row.delta < 0 ? styles.deltaDown : styles.deltaZero;
          const verdictClass = row.correct
            ? styles.verdictOk
            : row.pickIndex !== null
              ? styles.verdictNo
              : '';
          const leader = totals && top > 0 && row.score === top;
          return (
            <li
              key={row.playerId}
              className={`${styles.row} ${styles.rowFinal} ${leader ? styles.rowCorrect : ''}`}
              style={{ '--i': index } as CSSProperties}
            >
              {/* I-542: the place, once the board is in rank order */}
              {ranked ? (
                <span className={styles.rankNum}>{rows.filter((r) => r.score > row.score).length + 1}</span>
              ) : null}
              <Avatar avatarId={row.avatarId} size={48} dim={!row.connected} />
              <span className={styles.stack}>
                <span className={styles.name}>{row.name}</span>
                <span className={styles.bet}>
                  {judged ? (
                    <span className={`${styles.pop} ${verdictClass}`} aria-label={verdict.label}>
                      {verdict.glyph}&nbsp;
                    </span>
                  ) : null}
                  {bet > 0 ? L('bet {bet}', { bet }) : L('no bet')}
                  {totals ? (
                    <span className={`${styles.pop} ${styles.total}`}>&nbsp;· {row.score} pts</span>
                  ) : null}
                </span>
              </span>
              <span className={`${styles.delta} ${styles.deltaFinal} ${deltaClass}`}>
                {judged ? <span className={styles.pop}>{deltaText(row.delta)}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
