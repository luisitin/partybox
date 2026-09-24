// Phone view for Nightfall — placeholder until the screens are built (NOTES: stage 3).
import type { JSX } from 'react';
import { WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import type { Input } from '../server/types';
import { STRINGS } from './strings';

export function Controller({
  view,
}: GameControllerProps<NightfallControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  return <WaitingScreen title={L.sent(view.role?.name ?? '')} mood="watch" />;
}
