// Placeholder until the TV screens land (build stage 3).
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { EchoTvView } from '../server/views';

export function Tv({ view }: GameTvProps<EchoTvView>): JSX.Element {
  return (
    <Stage center>
      <BigText level="display">{view.phaseId}</BigText>
    </Stage>
  );
}
