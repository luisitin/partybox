// The Bingo phone's card-pick step (the intro): the "who is still picking" caption and the two
// buttons under the dealt cards. Split from Overlays.tsx (2026-09-23) to keep both under 300 lines.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, buzz, useHold, useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { PlayCue } from '@partybox/game-sdk/ui';
import { dealDoneMs } from '../server/constants';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

/**
 * The card pick's caption: the deal, then who is still picking. No readiness and no count-in
 * (ADR-053, reviewer 59a5f4): the shell's stage did READY and the 3 · 2 · 1; once everyone has
 * picked, the first number simply comes.
 */
/** How close to the pick's deadline the "cards stand" line shows: long enough to read it. */
const STAND_NOTE_S = 5;

export function IntroCount({
  deadline,
  cards,
  ready,
  waitingOn,
  lastOne,
}: {
  /** The pick's deadline: near it, a calm line says the dealt cards will stand (Foundation note). */
  deadline: number | null;
  /** Cards dealt: the caption says "dealing" only while the deal is on (loop 302). */
  cards: number;
  /** This phone has picked (tapped Play these); who has not yet (the card-pick step, loop 344). */
  ready: boolean;
  waitingOn: string[];
  /** Everyone else has picked: one nudge buzz and the caption says so (loop 351). */
  lastOne: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const left = useSecondsLeft(deadline, false, 250);
  // Once the last card is down the caption stops saying "dealing" (loop 302; a second a card, 345).
  const dealt = useHold('deal', dealDoneMs(cards));
  useEffect(() => {
    if (lastOne) buzz([30, 50, 30]); // the shell's "needs you" pattern, once
  }, [lastOne]);
  return (
    <p className={styles.introCount} aria-live="polite">
      {dealt
        ? ready
          ? waitingOn.length > 2
            ? L('picked — waiting for {n} more', { n: waitingOn.length })
            : waitingOn.length === 2
              ? L('picked — waiting for {a} and {b}', {
                  a: waitingOn[0] ?? '',
                  b: waitingOn[1] ?? '',
                })
              : waitingOn.length === 1
                ? L('picked — waiting for {name}', { name: waitingOn[0] ?? '' })
                : L('everyone has picked')
          : left !== null && left <= STAND_NOTE_S
            ? // content, not a timeout: an unpicked hand simply plays as dealt
              cards > 1
              ? L('the dealt cards stand in {n} s', { n: left })
              : L('the dealt card stands in {n} s', { n: left })
            : lastOne
              ? L('everyone is waiting for you')
              : cards > 1
                ? L('swap a card, or play these')
                : L('swap it, or play it')
        : L('dealing the cards…')}
    </p>
  );
}

/**
 * The card-pick step's two buttons (loop 344): "🎲 Another · card N" and Play these (picking,
 * not readiness — ADR-053). They rise in once
 * the last card has landed (loop 368) — before that the footer stood bare under an empty table,
 * and Ready could be tapped before a card was even seen.
 */
export function IntroActions({
  view,
  cards,
  pick,
  canSwap,
  send,
  play,
  onSwap,
}: {
  view: BingoControllerView;
  cards: number;
  pick: number;
  canSwap: boolean;
  send: (input: Input) => void;
  play: PlayCue;
  onSwap: () => void;
}): JSX.Element {
  const dealt = useHold('deal', dealDoneMs(cards));
  const L = useT(STRINGS);
  const swap = canSwap ? L('Another') : view.ready ? L('Kept') : L('Swapped');
  return (
    <div className={`${styles.introActions} ${dealt ? styles.introActionsIn : ''}`}>
      <PrimaryButton
        tone="neutral"
        disabled={!canSwap || !dealt}
        onClick={() => {
          // The old card flips away and the new one flips in (loop 268): the flip is the card's
          // key; the pluck lands as the new face turns to the eye (~200 ms in).
          send({ type: 'swap', card: pick });
          onSwap();
          buzz(20);
          setTimeout(() => play('card'), 200);
        }}
      >
        🎲 {swap}
        {cards > 1 ? ` · ${L('card {n}', { n: pick + 1 })}` : ''}
      </PrimaryButton>
      <PrimaryButton
        tone={view.ready ? 'success' : 'accent'}
        disabled={view.ready || !dealt}
        className={view.lastOne ? styles.nudge : undefined}
        onClick={() => {
          buzz(20);
          play('submit');
          send({ type: 'ready' });
        }}
      >
        {view.ready ? L('✓ Picked') : cards > 1 ? L('Play these') : L('Play it')}
      </PrimaryButton>
    </div>
  );
}
