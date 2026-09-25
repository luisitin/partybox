// `bet` on the phone: pick what you think is inside (the box's contents are big tappable cards
// with their odds and payouts), then how much — the shared BidPad, 0 up to all your coins. A resend
// changes the bet. "Sit this one out" bets nothing. A broke player is told they got 10 to play with.
import { useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import { BidPad } from '@partybox/game-sdk/ui/bid-pad';
import { PITY_COINS } from '../server/timing';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { COIN, iconOf, nameOf } from './copy';
import { OptionBoard } from './Options';
import { LotTitle } from './PhoneLot';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Props = GameControllerProps<BlindAuctionControllerView, Input>;

export function PhoneBet({ view, send }: Props): JSX.Element | null {
  const L = useT(STRINGS);
  const [option, setOption] = useState<number | null>(view.myBet?.option ?? null);
  const [amount, setAmount] = useState(view.myBet?.amount ?? 0);
  const box = view.box;
  if (!box) return null;
  const what = option !== null ? box.options[option] : undefined;
  const label = what ? `${iconOf(what)} ${nameOf(L, what)}` : '';
  // "Placed" only while the shown bet is the one sent: picking another content re-arms the button.
  // Sitting out is sitting out whatever card is picked.
  const placed = !view.myBet
    ? null
    : view.myBet.amount === 0
      ? 0
      : view.myBet.option === option
        ? view.myBet.amount
        : null;
  // Hot potato: you cannot back yourself (you could just keep it).
  const self = box.event === 'potato' && option !== null && option === view.mySeat;
  const notice =
    self || view.notice?.code === 'self' ? (
      L('You can’t bet on yourself: pick someone else')
    ) : view.notice?.code === 'over' ? (
      <span key={view.notice.at}>
        {L('You only have {coin} {n}', { coin: COIN, n: view.notice.have })}
      </span>
    ) : option === null && amount > 0 ? (
      L('Pick what is inside first')
    ) : view.topped ? (
      L('You ran out of coins: here are {coin} {n} to play with', { coin: COIN, n: PITY_COINS })
    ) : null;
  return (
    <BidPad
      value={amount}
      max={view.coins}
      placed={placed}
      onChange={setAmount}
      onConfirm={(n) => {
        if (option !== null) send({ type: 'bet', option, amount: n });
      }}
      onPass={() => {
        setAmount(0);
        send({ type: 'bet', option: option ?? 0, amount: 0 });
      }}
      blocked={option === null || self}
      texts={{
        place: (n) => L('Bet {coin} {n} on {what}', { coin: COIN, n, what: label }),
        change: (n) => L('Change to {coin} {n} on {what}', { coin: COIN, n, what: label }),
        placed: (n) => L('✓ {coin} {n} on {what}', { coin: COIN, n, what: label }),
        zero: option === null ? L('Pick what is inside') : L('Choose your stake'),
        pass: L('Sit this one out'),
        passed: L('✓ Sitting this one out'),
      }}
      header={
        <div className={styles.betHead}>
          <LotTitle box={box} />
          <OptionBoard options={box.options} size="phone" selected={option} onSelect={setOption} />
        </div>
      }
      notice={notice}
    />
  );
}
