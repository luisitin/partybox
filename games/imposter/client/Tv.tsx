// Placeholder — replaced by the real TV stage.
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { ImposterTvView } from '../server/index';

export function Tv({ view }: GameTvProps<ImposterTvView>): React.JSX.Element {
  return <div>{view.phaseId}</div>;
}
