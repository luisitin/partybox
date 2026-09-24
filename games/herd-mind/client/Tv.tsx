// TV for Herd Mind — placeholder while the server lands; the full stage replaces it.
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';

export function Tv({ view }: GameTvProps<HerdTvView>): JSX.Element {
  return (
    <Stage center>
      <BigText level="display">{view.prompt}</BigText>
    </Stage>
  );
}
