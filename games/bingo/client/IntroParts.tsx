// The Bingo phone's card-pick step (the intro): the "first number in 3 · 2 · 1" caption and the two
// buttons under the dealt cards. Split from Overlays.tsx (2026-09-23) to keep both under 300 lines.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, buzz, useHold, useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { PlayCue } from '@partybox/game-sdk/ui';
import { dealDoneMs } from '../server/types';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

/**
 * The intro's last three seconds in the hand (loop 263): "first number in 3 · 2 · 1" with one
 * light tap per second — the TV ticks, the phones tap, one clock. Before that: the deal.
 */
export function IntroCount({
  deadline,
  cards,
  ready,
  waitingOn,
  lastOne,
}: {
  deadline: number | null;
  /** Cards dealt: the caption says "dealing" only while the deal is on (loop 302). */
  cards: number;
  /** This phone tapped Ready; who has not yet (the card-pick step, loop 344). */
  ready: boolean;
  waitingOn: string[];
  /** Everyone else is ready: one nudge buzz and the caption says so (loop 351). */
  lastOne: boolean;
}): JSX.Element {
  const left = useSecondsLeft(deadline, false, 50);
  const L = useT(STRINGS);
  const shown = left !== null && left <= 3 && left > 0 ? left : 0;
  useEffect(() => {
    if (shown > 0) buzz(15);
  }, [shown]);
  // Once the last card is down the caption stops saying "dealing" (loop 302; a second a card, 345).
  const dealt = useHold('deal', dealDoneMs(cards));
  useEffect(() => {
    if (lastOne) buzz([30, 50, 30]); // the shell's "needs you" pattern, once
  }, [lastOne]);
  return (
    <p className={styles.introCount} aria-live="polite">
      {shown > 0 ? (
        <>
          {L('first number in')}{' '}
          <b key={shown} className="pb-tick">
            {shown}
          </b>
        </>
      ) : dealt ? (
        ready ? (
          waitingOn.length > 2 ? (
            L('ready — waiting for {n} more', { n: waitingOn.length })
          ) : waitingOn.length === 2 ? (
            L('ready — waiting for {a} and {b}', { a: waitingOn[0] ?? '', b: waitingOn[1] ?? '' })
          ) : waitingOn.length === 1 ? (
            L('ready — waiting for {name}', { name: waitingOn[0] ?? '' })
          ) : (
            L('everyone is ready')
          )
        ) : lastOne ? (
          L('everyone is waiting for you')
        ) : cards > 1 ? (
          L('swap a card, or tap Ready')
        ) : (
          L('swap it, or tap Ready')
        )
      ) : (
        L('dealing the cards…')
      )}
    </p>
  );
}

/**
 * The card-pick step's two buttons (loop 344): "🎲 Another · card N" and Ready. They rise in once
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
  const swap = canSwap ? L('Another') : view.ready ? L('Picked') : L('Swapped');
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
        {view.ready ? L('✓ Ready') : L('Ready')}
      </PrimaryButton>
    </div>
  );
}
