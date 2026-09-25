// TV view for Blind Auction: the rules and the ready-up, then one table for every round (box, bet,
// open) so the box never moves between them. Dumb by design: renders `view` only.
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlindAuctionTvView } from '../server/views';
import { STRINGS } from './strings';
import { TvRules } from './TvRules';
import { TvTable } from './TvTable';

export function Tv({ view }: GameTvProps<BlindAuctionTvView>): JSX.Element {
  const L = useT(STRINGS);
  switch (view.phaseId) {
    case 'rules':
      return <TvRules view={view} />;
    case 'box':
    case 'bet':
    case 'swap':
    case 'potato':
    case 'tug':
    case 'shuffle':
    case 'cups':
    case 'hands':
    case 'open':
      return <TvTable view={view} />;
    default:
      return (
        <Stage center>
          <BigText level="h1">{L("That's the last box!")}</BigText>
        </Stage>
      );
  }
}
