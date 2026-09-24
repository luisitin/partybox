// Placeholder TV while the server is proven; replaced by the real stage (see NOTES.md).
import type { JSX } from 'react';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';

export function Tv({ view }: GameTvProps<FakeOutTvView>): JSX.Element {
  return <div>{view.phaseId}</div>;
}
