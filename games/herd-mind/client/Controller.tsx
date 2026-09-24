// Phone for Herd Mind — placeholder while the server lands; the full controller replaces it.
import type { JSX } from 'react';
import { WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { HerdControllerView } from '../server/views';

export function Controller({ view }: GameControllerProps<HerdControllerView, Input>): JSX.Element {
  return <WaitingScreen title={view.prompt} mood="watch" />;
}
