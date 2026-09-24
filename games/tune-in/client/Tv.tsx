// TV view for Tune In: dumb, renders `view` (docs/GAME_CONTRACT.md). The round stage covers clue,
// dial, call and reveal; the intro and the scores are their own cards.
import type { JSX } from 'react';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { TuneTvView } from '../server/index';
import { TvIntro } from './TvIntro';
import { TvRound } from './TvRound';
import { TvScores } from './TvScores';

export function Tv(props: GameTvProps<TuneTvView>): JSX.Element {
  switch (props.view.phaseId) {
    case 'intro':
      return <TvIntro {...props} />;
    case 'scores':
    case 'done':
      return <TvScores {...props} />;
    default:
      return <TvRound {...props} />;
  }
}
