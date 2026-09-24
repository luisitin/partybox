// Placeholder phone while the server is proven; replaced by the real controller (see NOTES.md).
import type { JSX } from 'react';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { FakeOutControllerView } from '../server/index';

export function Controller({ view }: GameControllerProps<FakeOutControllerView>): JSX.Element {
  return <div>{view.phaseId}</div>;
}
