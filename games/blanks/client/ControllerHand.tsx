// Phone during "answer": the black card on top, the hand underneath as tappable white cards.
// A tap picks a card (numbered in pick order for Pick 2 / 3; tap again to unpick); the footer
// button says what it does and only enables at the right count. "Sent" is remembered locally
// until the server's view confirms it, so a double tap cannot send twice. The judge (czar mode)
// sees the black card and the count instead of a hand.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, PrimaryButton, Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard } from './Cards';
import { FanDots, NewHandCard, useFan, useHandList } from './HandFan';
import { NextButton } from './NextButton';
import { STRINGS } from './strings';
import styles from './blanks.module.css';

/** I-016 B: how long the played card flies before the pick is sent. */
const FLIGHT_MS = 300;
/** I-016: a card longer than this steps its type down one size so it reads whole in the fan. */
const LONG_CARD_CHARS = 64;

type Props = GameControllerProps<BlanksControllerView, Input>;

/** "2 / 5 in": the `{played}` and `{expected}` of the progress sentences. */
function progress(view: BlanksControllerView): { played: number; expected: number } {
  return { played: view.playedCount, expected: view.playersExpected };
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
  const L = useT(STRINGS);
  const [sent, setSent] = useState<number | null>(null);
  // Until the judge has taken one, all three read the same: dimming them before that made the
  // waiting screen look disabled (loop #204).
  const taken = view.blackChoices.some((b) => b.chosen);
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

export function ControllerHand({ view, send, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  // I-016 B: the played card flies up into the black card before the pick is sent (300 ms, the
  // card's own flight); the flight IS the send. The timer dies with the screen.
  const [flying, setFlying] = useState(false);
  const flight = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimeout(flight.current ?? undefined), []);
  // I-141 (the owner's design B): the fan's shape and where it is; the New hand card is the last.
  const [fanEl, setFanEl] = useState<HTMLUListElement | null>(null);
  // I-159: the hand is a list when the fan can't show a readable card
  const list = useHandList(fanEl);
  const at = useFan(list ? null : fanEl, view.hand.length + 1);
  const black = view.black;
  const pick = black?.pick ?? 1;
  if (!black)
    return (
      <WaitingScreen title={view.phoneOnly ? L('One moment…') : L('Look at the TV')} mood="watch" />
    );
  if (view.role === 'judge') {
    return (
      <WaitingScreen
        title={L("You're the judge")}
        hint={L(
          '{played} / {expected} in · you pick the winner after the reading.',
          progress(view),
        )}
        mood="watch"
      >
        <Table view={view} />
        <FilledCard text={black.text} pick={black.pick} size="phone" />
        <NextButton skip={skip} timed={view.timed} label={L('Start the reading now')} />
      </WaitingScreen>
    );
  }
  if (view.sitsOut) {
    // I-147 A: sudden death — this card is the tied players' to play; everyone else votes on it.
    return (
      <WaitingScreen
        title={L('Tie-break')}
        hint={L('Only the tied players play this card — you vote on it.')}
        mood="watch"
      >
        <Table view={view} />
        <FilledCard text={black.text} pick={black.pick} size="phone" />
      </WaitingScreen>
    );
  }
  if (view.myPlay) {
    // Everyone's in: the reading is a beat away, nothing left to hurry.
    const allIn = view.playedCount >= view.playersExpected;
    return (
      <WaitingScreen
        className="pb-enter"
        title={L('Played!')}
        hint={
          allIn
            ? L("Everyone's in — here comes the reading.")
            : view.timed
              ? L(
                  "{played} / {expected} in · the reading starts when everyone's in.",
                  progress(view),
                )
              : L(
                  '{played} / {expected} in · the reading starts when everyone is in, or when the VIP taps Next.',
                  progress(view),
                )
        }
        mood="done"
      >
        <Table view={view} />
        <FilledCard text={black.text} whites={view.myPlay} size="phone" />
        {/* Nothing to read yet, or everyone is in: no "don't wait" (review-loop #165). */}
        {allIn || view.playedCount === 0 ? null : (
          <NextButton skip={skip} timed={view.timed} label={L('Start the reading now')} />
        )}
      </WaitingScreen>
    );
  }
  if (view.hand.length < pick) {
    return (
      <WaitingScreen
        title={L('Out of cards')}
        hint={L('The deck ran dry — you sit this round out.')}
        mood="watch"
      >
        <FilledCard text={black.text} pick={black.pick} size="phone" />
      </WaitingScreen>
    );
  }
  const ready = picked.length === pick;
  const label =
    pick === 1
      ? L('Play this card')
      : ready
        ? L('Play these {n}', { n: pick })
        : L('Pick {n} more', { n: pick - picked.length });
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
          {pick > 1
            ? L('Round {round} · pick {n}, in order', { round: view.round, n: pick })
            : L('Round {round} · pick one', { round: view.round })}
        </span>
      }
      footer={
        <PrimaryButton
          done={sent}
          disabled={!ready}
          onClick={() => {
            if (!ready || sent) return;
            setSent(true);
            setFlying(true);
            flight.current = setTimeout(() => send({ type: 'play', cards: picked }), FLIGHT_MS);
          }}
        >
          {sent ? L('Played') : label}
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
        {list ? null : <FanDots cards={view.hand.length} at={at} />}
      </div>
      <ul
        ref={setFanEl}
        className={`${styles.hand} ${list ? styles.handList : ''} ${flying ? styles.handFlying : ''}`}
        aria-label={L('your hand')}
        data-picking={picked.length > 0 || undefined}
      >
        {view.hand.map((card, i) => {
          const order = picked.indexOf(card.id);
          const on = order !== -1;
          // I-016 (owner's note): every card's whole text reads without a tap — a long card
          // steps its type down one size rather than wrap past the card or be cut.
          const long = card.text.length > LONG_CARD_CHARS;
          return (
            // Dealt 150 ms apart (the CSS sets the motion); a re-render on a tap keeps the <li>,
            // so the deal plays once, when the hand arrives. --pb-i turns the card in the fan.
            <li
              key={card.id}
              style={{ animationDelay: `${i * 150}ms`, '--pb-i': i } as CSSProperties}
            >
              <button
                type="button"
                className={`${styles.white} ${on ? styles.whiteOn : ''} ${long ? styles.whiteLong : ''}`}
                aria-pressed={on}
                disabled={sent}
                onClick={() => toggle(card.id)}
              >
                <span className={styles.whiteText}>{card.text}</span>
                {on ? (
                  <span
                    className={styles.order}
                    aria-label={
                      pick > 1
                        ? L('picked {n} of {count}', { n: order + 1, count: pick })
                        : L('picked')
                    }
                  >
                    {pick > 1 ? order + 1 : '✓'}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
        {/* A whole new hand, three times a game (the owner, 2026-09-21), as the fan's last card
            (I-141). The pick is dropped with the cards it pointed at; the fan goes back to card 1. */}
        <NewHandCard
          index={view.hand.length}
          cards={view.hand.length}
          left={view.redrawsLeft}
          disabled={sent}
          onRedraw={() => {
            if (sent || view.redrawsLeft === 0) return;
            setPicked([]);
            send({ type: 'redraw' });
            const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            fanEl?.scrollTo({ left: 0, behavior: still ? 'auto' : 'smooth' });
          }}
        />
      </ul>
    </Screen>
  );
}
