// The winner's own phone after a bingo: the card that won, what happens next, and the choice
// (keep going or move on) once the TV's verdict has landed.
import type { JSX } from 'react';
import { Screen } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { Card } from './Card';
import { DecideFooter } from './ControllerParts';
import type { Send } from './ControllerParts';
import { winTitle } from './copy';
import styles from './Controller.module.css';

/** What happens after this bingo: the room decides, fresh cards, or the final board. */
export function afterLine(view: BingoControllerView, iDecide: boolean): string {
  if (iDecide) return 'Keep these cards and carry on calling, or deal fresh ones? Anyone can pick.';
  if (view.decide && (view.decide.same || view.decide.blackout))
    return 'The players decide: keep going or next round.';
  return view.round < view.totalRounds ? 'Fresh cards next round.' : 'That was the last round.';
}

export function WinScreen({
  view,
  send,
  cards,
  iDecide,
}: {
  view: BingoControllerView;
  send: Send;
  /** Cards per player: "— card 2" on the title when there are several. */
  cards: number;
  iDecide: boolean;
}): JSX.Element {
  const claim = view.claim;
  const which = cards > 1 && claim ? ` — card ${claim.cardIndex + 1}` : '';
  return (
    <Screen
      key="bingo"
      title={winTitle(view, which)}
      footer={<DecideFooter view={view} send={send} />}
    >
      {claim ? (
        <div className={styles.winCard}>
          <Card numbers={claim.card} daubs={claim.daubs} green={claim.green} disabled />
        </div>
      ) : null}
      <p className={styles.hint}>
        {iDecide && cards > 1
          ? 'Keep going and this card sits the pattern out; your other cards play on. Anyone can pick.'
          : afterLine(view, iDecide)}
      </p>
    </Screen>
  );
}
