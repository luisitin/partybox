// Every phone during `guess` (§7.4): the surviving clues as chips. The guesser gets a box, Guess
// and a secondary Pass; everyone else "Ana is guessing…". A guess is sent once (held locally).
import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { PrimaryButton, Screen, useHold, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { EchoControllerView } from '../server/views';
import { survivorStepMs } from '../shared/rules';
import { EnglishTag } from './EnglishTag';
import { GUESS } from './timing';
import { usePhaseBeat } from './usePhaseBeat';
import { STRINGS } from './strings';
import styles from './phone.module.css';

const GUESS_MAX = 30;

function Clues({ view }: { view: EchoControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const { survivors, echoCount } = view.tv;
  const clueLine = view.tv.say.find((s) => s.text !== 'Echo!' && s.text !== 'Total echo!');
  const step = survivorStepMs(survivors.length, clueLine?.ms);
  const beat = usePhaseBeat(view.tv.phaseAt, [
    0,
    GUESS.echoFlip,
    ...survivors.map((_, i) => GUESS.firstSurvivor + i * step),
  ]);
  return (
    <>
      {survivors.length > 0 ? (
        <div className={styles.locked}>
          {survivors.map((s, i) => (
            <span
              key={`${s}:${i}`}
              className={styles.chip}
              data-hidden={beat < 2 + i ? '1' : '0'}
              style={{ '--i': i } as CSSProperties}
            >
              {beat >= 2 + i ? s : '…'}
            </span>
          ))}
        </div>
      ) : (
        <p className={styles.line}>
          {echoCount > 0 && beat < 1 ? '…' : echoCount > 0 ? L('Total echo!') : L('No clues!')}
        </p>
      )}
      {echoCount > 0 && beat >= 1 ? (
        <p className={styles.hint}>
          {echoCount === 1
            ? L('🔇 1 clue echoed away')
            : L('🔇 {n} clues echoed away', { n: echoCount })}
        </p>
      ) : null}
    </>
  );
}

export function PhoneGuess({
  view,
  send,
}: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const stalled = useHold(view.tv.phaseAt, 3000);
  const guesser = view.players.find((p) => p.id === view.tv.guesser)?.name ?? '?';
  if (view.role !== 'guesser') {
    return (
      <Screen className={styles.screen}>
        <div className={`${styles.stack} ${styles.center}`}>
          <p className={styles.kicker}>{L('The clues')}</p>
          <Clues view={view} />
          <p className={styles.hint}>{L('{name} is guessing…', { name: guesser })}</p>
        </div>
      </Screen>
    );
  }
  const go = (input: Input): void => {
    if (sent) return;
    setSent(true);
    send(input);
  };
  const can = text.trim().length > 0 && !sent;
  return (
    <Screen
      className={styles.screen}
      footer={
        <div className={styles.footerRow} data-two="1">
          <button
            type="button"
            className={styles.second}
            disabled={sent}
            onClick={() => go({ type: 'pass' })}
          >
            {L('Pass')}
          </button>
          <PrimaryButton
            disabled={!can}
            done={sent}
            onClick={() => can && go({ type: 'guess', text: text.trim() })}
          >
            {sent ? L('Sent!') : L('Guess')}
          </PrimaryButton>
        </div>
      }
    >
      <div className={styles.stack}>
        <p className={styles.kicker}>
          {L("What's the word?")}
          <EnglishTag />
        </p>
        <Clues view={view} />
        <input
          className={styles.input}
          data-idle={stalled && text.length === 0 && !sent ? '1' : '0'}
          value={text}
          maxLength={GUESS_MAX}
          disabled={sent}
          aria-label={L('Your guess')}
          placeholder={L('Your guess')}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="none"
          enterKeyHint="send"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && can) go({ type: 'guess', text: text.trim() });
          }}
        />
        <p className={styles.hint}>{L('A wrong guess burns the next word too. Pass if unsure.')}</p>
      </div>
    </Screen>
  );
}
