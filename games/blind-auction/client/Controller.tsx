// Phone view for Blind Auction. Every input phase carries all a player needs (P00 §3.7): the lot,
// its hint and your coins. Reveals show "👀 Watch the TV" until the TV has shown the moment, then
// your own line. `send` is the only way out; the server validates every bid.
import { useState } from 'react';
import type { JSX } from 'react';
import { WaitingScreen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import { BidPad } from '@partybox/game-sdk/ui/bid-pad';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { COIN } from './copy';
import { HowTo, LotSummary, PhoneLot } from './PhoneLot';
import { PhoneLive } from './PhoneLive';
import { PhoneResult } from './PhoneResult';
import { STRINGS } from './strings';

type Props = GameControllerProps<BlindAuctionControllerView, Input>;

function PhoneBid({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  // The pad's number is this phone's own; it starts at the bid already sent (a reload keeps it).
  const [value, setValue] = useState(view.myBid ?? 0);
  const notice =
    view.notice?.code === 'over' ? (
      <span key={view.notice.at}>
        {L('You only have {coin} {n}', { coin: COIN, n: view.notice.have })}
      </span>
    ) : null;
  return (
    <BidPad
      value={value}
      max={view.coins}
      placed={view.myBid}
      onChange={setValue}
      onConfirm={(amount) => send({ type: 'bid', amount })}
      onPass={() => {
        setValue(0);
        send({ type: 'bid', amount: 0 });
      }}
      header={view.lot ? <LotSummary lot={view.lot} /> : null}
      notice={notice}
    />
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const spectator = view.me.role !== 'player';
  switch (view.phaseId) {
    case 'intro':
      return <HowTo view={view} />;
    case 'lot':
      return <PhoneLot view={view} />;
    case 'bid':
      return spectator ? (
        <WaitingScreen title={L('Bids are in secret')} mood="watch" />
      ) : (
        // Keyed by lot: a fresh pad for every lot.
        <PhoneBid key={view.lot?.n ?? 0} {...props} />
      );
    case 'live':
      return <PhoneLive {...props} />;
    case 'sold':
    case 'flip':
      return <PhoneResult view={view} />;
    default:
      return (
        <WaitingScreen title={phoneOnly ? L('One moment…') : L('Look at the TV')} mood="watch" />
      );
  }
}
