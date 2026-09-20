// Phone during "answer": the black card on top, the hand underneath as tappable white cards.
// A tap picks a card (numbered in pick order for Pick 2 / 3; tap again to unpick); the footer
// button says what it does and only enables at the right count. "Sent" is remembered locally
// until the server's view confirms it, so a double tap cannot send twice. The judge (czar mode)
// sees the black card and the count instead of a hand.
import { useState } from 'react';
import type { JSX } from 'react';
import { Avatar, PrimaryButton, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
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

/** The table as the TV shows it: one slot per expected card, the played ones face-down. */
function Table({ view }: { view: BlanksControllerView }): JSX.Element {
  return (
    <div className={`${styles.pips} ${styles.pipsPhone}`} aria-hidden>
      {Array.from({ length: view.playersExpected }, (_, i) => (
        <span
          key={i}
          className={`${styles.pip} ${i < view.playedCount ? styles.pipDone : ''} ${i === view.playedCount - 1 ? styles.pipPop : ''}`}
        />
      ))}
    </div>
  );
}

/** czar mode: the judge taps one of three black cards; everyone else sees who is choosing. */
export function ControllerPick({ view, send }: Props): JSX.Element {
  const [sent, setSent] = useState<number | null>(null);
  // Until the judge has taken one, all three read the same: dimming them before that made the
  // waiting screen look disabled (loop #204).
  const taken = view.blackChoices.some((b) => b.chosen);
  if (view.role !== 'judge') {
    return (
      <WaitingScreen
        title={`${view.czar?.name ?? 'The judge'} is picking the question`}
        hint="Your hand is next — the card they choose is the one you play on."
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
          <ul className={styles.peekList} aria-label="the questions on the table">
            {view.blackChoices.map((b, i) => (
              <li key={i} className={b.chosen ? styles.peekOn : taken ? styles.peekOff : undefined}>
                <FilledCard text={b.text} pick={b.pick} size="mini" winner={b.chosen} />
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
        <span className={styles.kicker}>Round {view.round} · you judge — pick the question</span>
      }
    >
      <ul className={styles.choiceList} aria-label="the black cards">
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
      <p className="pb-caption pb-muted">Tap the one the room should answer.</p>
    </Screen>
  );
}

export function ControllerHand({ view, send, skip }: Props): JSX.Element {
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
        <Table view={view} />
        <FilledCard text={black.text} pick={black.pick} size="phone" />
        <NextButton skip={skip} timed={view.timed} label="Start the reading now" />
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
            : `${progressLine(view)} · ${view.timed ? "the reading starts when everyone's in." : 'the reading starts when everyone is in, or when the VIP taps Next.'}`
        }
        mood="done"
      >
        <Table view={view} />
        <FilledCard text={black.text} whites={view.myPlay} size="phone" />
        {/* Nothing to read yet, or everyone is in: no "don't wait" (review-loop #165). */}
        {allIn || view.playedCount === 0 ? null : (
          <NextButton skip={skip} timed={view.timed} label="Start the reading now" />
        )}
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
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length < pick) return [...p, id];
      // A Pick 1 round is a choice, not a checklist: tapping another card moves the pick to it,
      // instead of doing nothing until the first is untapped (review-loop #240). With two or three
      // blanks the order is the joke, so a full pick still has to be undone deliberately.
      return pick === 1 ? [id] : p;
    });
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
      <ul className={styles.hand} aria-label="your hand" data-picking={picked.length > 0 || undefined}>
        {view.hand.map((card, i) => {
          const order = picked.indexOf(card.id);
          const on = order !== -1;
          return (
            // Dealt 150 ms apart (the CSS sets the motion); a re-render on a tap keeps the <li>,
            // so the deal plays once, when the hand arrives.
            <li key={card.id} style={{ animationDelay: `${i * 150}ms` }}>
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
