// TV view for Blind Auction: the intro, then one table for every lot phase (lot, bid, live, sold,
// flip) so the card never moves between them. Dumb by design: renders `view` only.
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlindAuctionTvView } from '../server/views';
import { STRINGS } from './strings';
import { TvIntro } from './TvIntro';
import { TvTable } from './TvTable';

export function Tv({ view }: GameTvProps<BlindAuctionTvView>): JSX.Element {
  const L = useT(STRINGS);
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro view={view} />;
    case 'lot':
    case 'bid':
    case 'live':
    case 'sold':
    case 'flip':
      return <TvTable view={view} />;
    default:
      return (
        <Stage center>
          <BigText level="h1">{L("That's the auction!")}</BigText>
        </Stage>
      );
  }
}
