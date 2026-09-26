// Calm phones: the guesser while the others write and check ("You're guessing! No peeking"), the
// intro's how-to-play (with the VIP's Let's go), and spectators, who get the TV's story only.
import type { JSX } from 'react';
import { Screen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { EchoControllerView } from '../server/views';
import { beforeResultCounts } from './deck-counts';
import { RESULT } from './timing';
import { usePhaseBeat } from './usePhaseBeat';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function PhoneDeck({ view }: { view: EchoControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const beat = usePhaseBeat(view.tv.phaseAt, [0, RESULT.pile]);
  const counts =
    view.phaseId === 'result' && view.tv.result && beat === 0
      ? beforeResultCounts(view.tv.counts, view.tv.result)
      : view.tv.counts;
  const { left, won, lost } = counts;
  return (
    <ul
      className={styles.deck}
      aria-label={L('{left} left, {won} won, {lost} lost', { left, won, lost })}
    >
      <li className={styles.deckItem}>
        <span className={styles.deckNum}>{left}</span>
        {L('left')}
      </li>
      <li className={styles.deckItem}>
        <span className={styles.deckNum}>{won}</span>
        {L('won')}
      </li>
      <li className={styles.deckItem}>
        <span className={styles.deckNum}>{lost}</span>
        {L('lost')}
      </li>
    </ul>
  );
}

export function PhoneGuesserWait({ view }: { view: EchoControllerView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className={styles.screen}>
      <div className={`${styles.stack} ${styles.center}`}>
        <p className={styles.kicker}>
          {L('Word {n} of {total}', { n: view.tv.wordNo, total: view.tv.deckSize })}
        </p>
        <p className={styles.bigIcon}>🙈</p>
        <p className={styles.line}>{L("You're guessing!")}</p>
        <p className={styles.hint}>
          {view.phaseId === 'check'
            ? L('No peeking at other phones. They are checking for echoes…')
            : L('No peeking at other phones. They are writing clues…')}
        </p>
        <PhoneDeck view={view} />
      </div>
    </Screen>
  );
}

export function PhoneIntro({ view }: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className={styles.screen}>
      <div className={`${styles.stack} ${styles.center}`}>
        <p className={styles.bigIcon}>🔁</p>
        <p className={styles.line}>{L('Echo')}</p>
        <p className={styles.hint}>{L('Deck: {n} words', { n: view.tv.deckSize })}</p>
      </div>
    </Screen>
  );
}

export function PhoneWatcher({ view }: { view: EchoControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const guesser = view.players.find((p) => p.id === view.tv.guesser)?.name;
  return (
    <Screen className={styles.screen}>
      <div className={`${styles.stack} ${styles.center}`}>
        <p className={styles.bigIcon}>🔁</p>
        <p className={styles.line}>
          {view.phaseId === 'done'
            ? L('Thanks for playing!')
            : guesser
              ? L('{name} is guessing', { name: guesser })
              : L('Watch the TV')}
        </p>
        <PhoneDeck view={view} />
      </div>
    </Screen>
  );
}
