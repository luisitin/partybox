// Phone view for Blind Auction. Every input phase carries all a player needs (P00 §3.7): the box,
// what it might hold, the odds and your coins. The reveal shows "👀 Watch the TV" until the TV has
// opened the box, then your own line. `send` is the only way out; the server validates every bet.
import type { JSX } from 'react';
import { WaitingScreen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { PhoneBet } from './PhoneBet';
import { PhoneBox, PhoneRules } from './PhoneLot';
import { PhoneResult } from './PhoneResult';
import { PhoneSwap } from './PhoneSwap';
import { PhonePotato } from './Potato';
import { PhoneTug } from './Tug';
import { PhoneCups, PhoneShuffle } from './Shells';
import { STRINGS } from './strings';

type Props = GameControllerProps<BlindAuctionControllerView, Input>;

export function Controller(props: Props): JSX.Element {
  const { view, send } = props;
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const spectator = view.me.role !== 'player';
  switch (view.phaseId) {
    case 'rules':
      return (
        <PhoneRules view={view} onReady={spectator ? undefined : () => send({ type: 'ready' })} />
      );
    case 'box':
      return <PhoneBox view={view} />;
    case 'bet':
      return spectator ? (
        <WaitingScreen title={L('Bets are secret')} mood="watch" />
      ) : (
        // Keyed by box: a fresh picker and pad for every box.
        <PhoneBet key={view.box?.n ?? 0} {...props} />
      );
    case 'tug':
      return <PhoneTug {...props} />;
    case 'shuffle':
      return <PhoneShuffle {...props} />;
    case 'cups':
      return <PhoneCups {...props} />;
    case 'potato':
      return spectator ? (
        <WaitingScreen title={L('Look at the TV')} mood="watch" />
      ) : (
        <PhonePotato {...props} />
      );
    case 'swap':
      return <PhoneSwap key={view.box?.n ?? 0} {...props} />;
    case 'open':
      return <PhoneResult view={view} />;
    default:
      return (
        <WaitingScreen title={phoneOnly ? L('One moment…') : L('Look at the TV')} mood="watch" />
      );
  }
}
