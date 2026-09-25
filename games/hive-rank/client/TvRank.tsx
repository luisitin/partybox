// The TV's `intro` (the title and three steps) and `rank` (the question, its two ends, the five
// things as cards dealt onto the table, and how many have locked in).
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { HiveTvView } from '../server/views';
import { EnglishNote } from './EnglishNote';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

/** The game's own button (the host runs the room from the TV, ADR-031), after a beat. */
export function TvButton({
  label,
  skip,
  delayMs = 1200,
}: {
  label: string;
  skip: () => void;
  delayMs?: number;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const [up, setUp] = useState(delayMs === 0);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const h = setTimeout(() => setUp(true), delayMs);
    return () => clearTimeout(h);
  }, [delayMs]);
  if (!up) return <span className={styles.buttonSlot} />;
  return (
    <button
      type="button"
      className={styles.tvButton}
      disabled={sent}
      onClick={() => {
        setSent(true);
        skip();
      }}
    >
      {sent ? L('Moving on…') : `${label} ▶`}
    </button>
  );
}

/** A short title beat after the shell's start stage (ADR-053 showed the rules, READY and
 *  3 · 2 · 1): the name, the one hint that matters, and the first round on its way. */
export function TvIntro(): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage center className={styles.introStage}>
      <div className={styles.titleRow}>
        <span className={styles.bee} aria-hidden>
          🐝
        </span>
        <BigText level="display" tone="accent">
          Hive Rank
        </BigText>
      </div>
      <p className={styles.introNote}>
        {L('You’re not ranking what you like — you’re predicting the room.')}
      </p>
    </Stage>
  );
}

/** "Round 2 of 6" and the question with its two ends — shared by rank, hive and score. */
export function QuestionHeader({
  view,
  size = 'h1',
  kicker,
}: {
  view: HiveTvView;
  size?: 'h1' | 'h2';
  kicker?: string | undefined;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const q = view.question;
  if (!q) return null;
  return (
    <header className={styles.header}>
      <span className={styles.kicker}>
        {L('Round {n} of {total}', { n: view.round, total: view.rounds })}
        {kicker ? ` · ${kicker}` : ''}
      </span>
      <h1 className={size === 'h1' ? styles.prompt : styles.promptSmall}>{q.prompt}</h1>
      <EnglishNote />
      <span className={styles.ends}>
        {L('1 = {top} · 5 = {bottom}', { top: L(q.top), bottom: L(q.bottom) })}
      </span>
    </header>
  );
}

export function TvRank({ view }: { view: HiveTvView }): JSX.Element {
  const L = useT(STRINGS);
  const q = view.question;
  return (
    <Stage className={styles.rankStage}>
      <QuestionHeader view={view} />
      <ul className={styles.cards} key={view.round}>
        {(q?.items ?? []).map((item, i) => (
          <li key={item.id} className={styles.card} style={{ '--i': i } as CSSProperties}>
            <span className={styles.cardInner}>{item.label}</span>
          </li>
        ))}
      </ul>
      <p className={styles.lockLine} role="status">
        <span key={view.locked} className={styles.lockCount}>
          {L('{n} of {total} locked in', { n: view.locked, total: view.expecting })}
        </span>
        <span className={styles.lockHint}>{L('Rank them on your phone')}</span>
      </p>
    </Stage>
  );
}
