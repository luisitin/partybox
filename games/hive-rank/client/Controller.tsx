// The phone for Hive Rank: how to play, the OrderPicker, "👀 Watch the TV" while the hive counts
// down, and my order against the hive. `send` is the only way out; the server validates with
// inputSchema before reduce sees it. `skip` exists on the VIP's phone only (its Next buttons).
import type { JSX } from 'react';
import { Screen, WaitingScreen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { HiveControllerView } from '../server/views';
import type { Input } from '../server/types';
import { PhoneRank } from './PhoneRank';
import { PhoneScore } from './PhoneScore';
import { Ladder } from './PhoneStage';
import { STRINGS } from './strings';
import { readingDelay, useReading } from './useReading';
import styles from './Phone.module.css';

function Intro(): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className={styles.watch}>
      <span className={styles.watchBee} aria-hidden>
        🐝
      </span>
      <p className={styles.watchLine}>Hive Rank</p>
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
  if (view.short)
    return (
      <Screen className={styles.watch}>
        <span className={styles.watchBee} aria-hidden>
          🐝
        </span>
        <p className={styles.watchLine}>{L('👀 Watch the TV')}</p>
        <p className={styles.note}>{L('Not enough bees this round.')}</p>
      </Screen>
    );
  // The hive fills here too, in step with the TV (each spot only once the TV has landed it), so
  // the hand is never an empty screen while the room watches the reveal.
  return (
    <Screen>
      <p className={styles.watchLineSmall}>{L('👀 Watch the TV')}</p>
      <Ladder view={view} />
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
  if (view.phaseId === 'intro') return <Intro />;
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
