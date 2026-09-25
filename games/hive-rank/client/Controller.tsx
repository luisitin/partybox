// The phone for Hive Rank: how to play, the OrderPicker, "👀 Watch the TV" while the hive counts
// down, and my order against the hive. `send` is the only way out; the server validates with
// inputSchema before reduce sees it. `skip` exists on the VIP's phone only (its Next buttons).
import type { CSSProperties, JSX } from 'react';
import { Screen, WaitingScreen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { HiveControllerView } from '../server/views';
import type { Input } from '../server/types';
import { PhoneRank } from './PhoneRank';
import { NextButton, PhoneScore } from './PhoneScore';
import { STRINGS } from './strings';
import { readingDelay, useReading } from './useReading';
import styles from './Phone.module.css';

const STEPS = [
  'You get five things and a question, like “best to worst road-trip snack”. Put them in order.',
  'Everyone’s orders are combined into the hive’s order.',
  'Score 2 for each thing in the hive’s exact spot, and 1 if you’re one spot off.',
] as const;

function Intro({
  view,
  skip,
}: {
  view: HiveControllerView;
  skip?: (() => void) | undefined;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen footer={<NextButton view={view} skip={skip} />}>
      <div className={styles.introHead}>
        <span className={styles.introBee} aria-hidden>
          🐝
        </span>
        <h2 className={styles.prompt}>Hive Rank</h2>
      </div>
      <ol className={styles.introSteps}>
        {STEPS.map((step, i) => (
          <li key={step} className={styles.introStep} style={{ '--i': i } as CSSProperties}>
            <span className={styles.introNum}>{i + 1}</span>
            <span>{L(step)}</span>
          </li>
        ))}
      </ol>
      <p className={styles.note}>
        {L('You’re not ranking what you like — you’re predicting the room.')}
      </p>
    </Screen>
  );
}

/** At-TV phones during the reveal: nothing to spoil, but never a dead screen — the bee bobs and
 *  five pips fill as the TV lands each spot. */
function WatchTv({ view }: { view: HiveControllerView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className={styles.watch}>
      <span className={styles.watchBee} aria-hidden>
        🐝
      </span>
      <p className={styles.watchLine}>{L('👀 Watch the TV')}</p>
      <p className={styles.note}>
        {view.short ? L('Not enough bees this round.') : L('The hive is counting down…')}
      </p>
      {view.short ? null : (
        <span className={styles.pips} aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`${styles.pip} ${view.step >= i ? styles.pipOn : ''}`} />
          ))}
        </span>
      )}
    </Screen>
  );
}

export function Controller({
  view,
  send,
  skip,
}: GameControllerProps<HiveControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  // Phones speak only in a phone-only room (the TV reads otherwise).
  useReading(
    view.speech,
    phoneOnly && view.phaseId !== 'hive',
    readingDelay(view.phaseId, view.step),
  );
  if (view.phaseId === 'intro') return <Intro view={view} skip={skip} />;
  if (view.me.role !== 'player')
    return (
      <WaitingScreen
        title={L('You’re in from the next game')}
        hint={view.question ? view.question.prompt : undefined}
        mood="wait"
      />
    );
  if (view.phaseId === 'rank') return <PhoneRank key={view.round} view={view} send={send} />;
  if (view.phaseId === 'hive') return <WatchTv view={view} />;
  if (view.phaseId === 'score') return <PhoneScore view={view} skip={skip} />;
  return <WaitingScreen title={L('That’s the hive!')} mood="done" />;
}
