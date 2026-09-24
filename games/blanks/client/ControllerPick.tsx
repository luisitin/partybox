// Phone during "pick" (czar mode): the judge taps one of three black cards; everyone else waits
// with the three on screen (a phone-only room sees them here), their hand under them (I-148 A), a
// tap trying their front card in a setup (B), and the hand lighting up as the judge takes one (C).
import { useState } from 'react';
import type { JSX } from 'react';
import { Avatar, Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard } from './Cards';
import { STRINGS } from './strings';
import styles from './blanks.module.css';

type Props = GameControllerProps<BlanksControllerView, Input>;

/** czar mode: the judge taps one of three black cards; everyone else sees who is choosing. */
export function ControllerPick({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const [sent, setSent] = useState<number | null>(null);
  // Until the judge has taken one, all three read the same: dimming them before that made the
  // waiting screen look disabled (loop #204).
  const taken = view.blackChoices.some((b) => b.chosen);
  // I-148 B: the candidate being tried on — its blank reads this phone's front card.
  const [tryOn, setTryOn] = useState<number | null>(null);
  if (view.role !== 'judge') {
    return (
      <WaitingScreen
        title={
          view.czar
            ? L('{name} is picking the question', { name: view.czar.name })
            : L('The judge is picking the question')
        }
        hint={L('Your hand is next — the card they choose is the one you play on.')}
        mood="watch"
      >
        {view.czar ? (
          <span className={styles.judgeChip}>
            <Avatar avatarId={view.czar.avatarId} size="var(--pb-chip-size)" />
            {view.czar.name}
          </span>
        ) : null}
        {/* The three questions are on the TV for everyone anyway: a phone-only room sees them
            here too, and the one the judge takes lights up while the others step back (loop
            #204). */}
        {view.blackChoices.length > 0 ? (
          <ul className={styles.peekList} aria-label={L('the questions on the table')}>
            {view.blackChoices.map((b, i) => (
              <li key={i} className={b.chosen ? styles.peekOn : taken ? styles.peekOff : undefined}>
                {/* I-148 B: tap a setup to hear your front card in it. */}
                <button
                  type="button"
                  className={styles.tryOn}
                  onClick={() => setTryOn((t) => (t === i ? null : i))}
                  aria-pressed={tryOn === i}
                  aria-label={L('try your first card in this question')}
                >
                  <FilledCard
                    text={b.text}
                    pick={b.pick}
                    size="mini"
                    winner={b.chosen}
                    whites={tryOn === i && view.hand[0] ? [view.hand[0].text] : undefined}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {/* I-148 A: the hand is here too — the wait is the only time to read it unhurried. */}
        {view.hand.length > 0 ? (
          <ul
            className={`${styles.peekHand} ${taken ? styles.peekHandLit : ''}`}
            aria-label={L('your hand')}
          >
            {view.hand.map((c) => (
              <li key={c.id}>
                <span className={styles.peekHandCard}>{c.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </WaitingScreen>
    );
  }
  return (
    <Screen
      className="pb-enter"
      title={
        <span className={styles.kicker}>
          {L('Round {round} · you judge — pick the question', { round: view.round })}
        </span>
      }
    >
      <ul className={styles.choiceList} aria-label={L('the black cards')}>
        {view.blackChoices.map((b, i) => (
          <li key={i}>
            <button
              type="button"
              className={`${styles.choice} ${sent === i ? styles.choiceOn : ''}`}
              disabled={sent !== null}
              aria-pressed={sent === i}
              onClick={() => {
                if (sent !== null) return;
                setSent(i);
                send({ type: 'choose', index: i });
              }}
            >
              <FilledCard text={b.text} pick={b.pick} size="phone" />
            </button>
          </li>
        ))}
      </ul>
      <p className="pb-caption pb-muted">{L('Tap the one the room should answer.')}</p>
    </Screen>
  );
}
