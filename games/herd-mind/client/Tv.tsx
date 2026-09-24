// TV for Herd Mind: one stage per phase, inside the overscan-safe Stage. Dumb — renders the view,
// plays its readings and cues on the choreography's beats; the shell shows the strip, the timer
// and the host bar.
import type { JSX } from 'react';
import { Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { TvAnswer } from './TvAnswer';
import { TvHerd } from './TvHerd';
import { TvIntro } from './TvIntro';
import { TvScore } from './TvScore';

function Screen({ view }: GameTvProps<HerdTvView>): JSX.Element {
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro view={view} />;
    case 'answer':
      return <TvAnswer view={view} />;
    case 'herd':
      return <TvHerd view={view} />;
    default:
      return <TvScore view={view} />;
  }
}

export function Tv({ view }: GameTvProps<HerdTvView>): JSX.Element {
  return (
    <Stage>
      <Screen view={view} />
    </Stage>
  );
}
