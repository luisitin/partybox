// Phone for Who Said It: write, guess, your own line after the flip, the board. In a phone-only
// room the shell shows PhoneStage for intro / prompt / reveal / scores instead; the reader then
// speaks on the phones (the shell hands them `clip`), so this plays the lines of the phases it owns.
import type { JSX } from 'react';
import { Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { WsPhoneView } from '../server/views';
import { PhoneGuess } from './PhoneGuess';
import { PhoneResult, PhoneScores } from './PhoneResult';
import { PhoneWrite } from './PhoneWrite';
import { STEPS } from './steps';
import { STRINGS } from './strings';
import { useSay } from './useSay';
import styles from './phone.module.css';

type Props = GameControllerProps<WsPhoneView, Input>;

export function PhoneIntro(): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className="pb-enter">
      <p className={styles.kicker}>🗣️ {L('Who Said It?')}</p>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step} className={styles.step}>
            <span className={styles.stepNo} aria-hidden>
              {i + 1}
            </span>
            <span>{L(step)}</span>
          </li>
        ))}
      </ol>
    </Screen>
  );
}

export function PhonePrompt({ view }: { view: WsPhoneView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className="pb-enter">
      <p className={styles.kicker}>
        {L('Question {n} of {total}', { n: view.n, total: view.total })}
      </p>
      <p key={view.n} className={`${styles.promptBig} ${styles.swing}`}>
        {view.prompt}
      </p>
      <p className={styles.hint}>{L('Get ready to answer…')}</p>
    </Screen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  const L = useT(STRINGS);
  useSay(view.say, `${view.phaseId}@${view.startedAt}`, view.deadline);
  if (view.me.role !== 'player')
    return <WaitingScreen title={L("You're in as soon as this one ends")} mood="watch" />;
  switch (view.phaseId) {
    case 'intro':
      return <PhoneIntro />;
    case 'prompt':
      return <PhonePrompt view={view} />;
    case 'write':
      return <PhoneWrite key={view.startedAt} {...props} />;
    case 'guess':
      return <PhoneGuess key={view.startedAt} {...props} />;
    case 'reveal':
      return <PhoneResult {...props} />;
    case 'scores':
    case 'done':
      return <PhoneScores {...props} />;
    default:
      return <WaitingScreen title={L('One moment…')} mood="wait" />;
  }
}
