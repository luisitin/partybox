// Placeholder until the phone screens land (build stage 3).
import type { JSX } from 'react';
import { WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { EchoControllerView } from '../server/views';
import type { Input } from '../server/types';

export function Controller({ view }: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  return <WaitingScreen title={view.phaseId} mood="watch" />;
}
