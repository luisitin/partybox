// Echo's TV: one stage per phase. Dumb: renders the view, never the word before `result`.
import type { JSX } from 'react';
import { Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { EchoTvView } from '../server/views';
import { FinaleBoard } from './Finale';
import { TvClue } from './TvClue';
import { TvGuess } from './TvGuess';
import { TvIntro } from './TvIntro';
import { TvResult } from './TvResult';

export function Tv(props: GameTvProps<EchoTvView>): JSX.Element | null {
  const { view } = props;
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro {...props} />;
    case 'clue':
    case 'check':
      return <TvClue {...props} />;
    case 'guess':
      // Keyed per word so every guess stage deals afresh.
      return <TvGuess key={view.phaseAt} {...props} />;
    case 'result':
      return <TvResult key={view.phaseAt} {...props} />;
    default:
      return (
        <Stage center>
          <FinaleBoard view={view} />
        </Stage>
      );
  }
}
