// TV view for Nightfall — placeholder until the stage is built (NOTES: stage 3).
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import { STRINGS } from './strings';

export function Tv({ view }: GameTvProps<NightfallTvView>): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage center>
      <BigText level="h1">{view.stage.lines.map((l) => L.sent(l)).join(' ')}</BigText>
    </Stage>
  );
}
