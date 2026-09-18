// Phone during "answer": the black card on top, the hand underneath as tappable white cards.
// A tap picks a card (numbered in pick order for Pick 2 / 3; tap again to unpick); the footer
// button says what it does and only enables at the right count. "Sent" is remembered locally
// until the server's view confirms it, so a double tap cannot send twice. The judge (czar mode)
// sees the black card and the count instead of a hand.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard } from './Cards';
import { NextButton } from './NextButton';
import styles from './blanks.module.css';

type Props = GameControllerProps<BlanksControllerView, Input>;

function progressLine(view: BlanksControllerView): string {
  return `${view.playedCount} / ${view.playersExpected} in`;
}

export function ControllerHand({ view, send }: Props): JSX.Element {
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const black = view.black;
  const pick = black?.pick ?? 1;
  if (!black) return <WaitingScreen title="Look at the TV" mood="watch" />;
  if (view.role === 'judge') {
    return (
      <WaitingScreen
        title="You're the judge"
        hint={`${progressLine(view)} · you pick the winner after the reading.`}
        mood="watch"
      >
        <FilledCard text={black.text} pick={black.pick} size="phone" />
        <NextButton send={send} timed={view.timed} label="Start the reading now" />
      </WaitingScreen>
    );
  }
  if (view.myPlay) {
    // Everyone's in: the reading is a beat away, nothing left to hurry.
    const allIn = view.playedCount >= view.playersExpected;
    return (
      <WaitingScreen
        className="pb-enter"
        title="Played!"
        hint={
          allIn
            ? "Everyone's in — here comes the reading."
            : `${progressLine(view)} · ${view.timed ? "the reading starts when everyone's in." : 'the reading starts when everyone is in, or when anyone taps Next.'}`
        }
        mood="done"
      >
        <FilledCard text={black.text} whites={view.myPlay} size="phone" />
        {allIn ? null : <NextButton send={send} timed={view.timed} label="Start the reading now" />}
      </WaitingScreen>
    );
  }
  if (view.hand.length < pick) {
    return (
      <WaitingScreen
        title="Out of cards"
        hint="The deck ran dry — you sit this round out."
        mood="watch"
      >
        <FilledCard text={black.text} pick={black.pick} size="phone" />
      </WaitingScreen>
    );
  }
  const ready = picked.length === pick;
  const label =
    pick === 1
      ? 'Play this card'
      : ready
        ? `Play these ${pick}`
        : `Pick ${pick - picked.length} more`;
  const toggle = (id: string): void => {
    if (sent) return;
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length < pick ? [...p, id] : p,
    );
  };
  return (
    <Screen
      className="pb-enter"
      title={
        <span className={styles.kicker}>
          Round {view.round} · {pick > 1 ? `pick ${pick}, in order` : 'pick one'}
        </span>
      }
      footer={
        <PrimaryButton
          done={sent}
          disabled={!ready}
          onClick={() => {
            if (!ready || sent) return;
            setSent(true);
            send({ type: 'play', cards: picked });
          }}
        >
          {sent ? 'Played' : label}
        </PrimaryButton>
      }
    >
      {/* Sticky: the sentence (and the live preview of the pick) stays in view while the hand
          scrolls under it — ten cards run past a phone's screen (review-loop #136). */}
      <div className={styles.handBlack}>
        <FilledCard
          text={black.text}
          pick={black.pick}
          whites={picked.map((id) => view.hand.find((c) => c.id === id)?.text ?? '')}
          size="phone"
        />
      </div>
      <ul className={styles.hand} aria-label="your hand">
        {view.hand.map((card) => {
          const order = picked.indexOf(card.id);
          const on = order !== -1;
          return (
            <li key={card.id}>
              <button
                type="button"
                className={`${styles.white} ${on ? styles.whiteOn : ''}`}
                aria-pressed={on}
                disabled={sent}
                onClick={() => toggle(card.id)}
              >
                <span className={styles.whiteText}>{card.text}</span>
                {on ? (
                  <span
                    className={styles.order}
                    aria-label={`picked${pick > 1 ? ` ${order + 1} of ${pick}` : ''}`}
                  >
                    {pick > 1 ? order + 1 : '✓'}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
