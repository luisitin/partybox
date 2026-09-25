// The TV's `intro` (the title and three steps) and `rank` (the question, its two ends, the five
// things as cards dealt onto the table, and how many have locked in).
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { HiveTvView } from '../server/views';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

const STEPS = [
  'You get five things and a question, like “best to worst road-trip snack”. Put them in order.',
  'Everyone’s orders are combined into the hive’s order.',
  'Score 2 for each thing in the hive’s exact spot, and 1 if you’re one spot off.',
] as const;

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

export function TvIntro({ skip }: { skip?: (() => void) | undefined }): JSX.Element {
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
      <BigText level="h2">{L('Rank five things the way the hive would.')}</BigText>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step} className={styles.step} style={{ '--i': i } as CSSProperties}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span>{L(step)}</span>
          </li>
        ))}
      </ol>
      <p className={styles.introNote}>
        {L('You’re not ranking what you like — you’re predicting the room.')}
      </p>
      {skip ? <TvButton label={L('Let’s go')} skip={skip} delayMs={600} /> : null}
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
      <span className={styles.ends}>
        {L('1 = {top} · 5 = {bottom}', { top: q.top, bottom: q.bottom })}
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
