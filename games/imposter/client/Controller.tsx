// Placeholder — replaced by the real controller.
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { ImposterControllerView } from '../server/index';

export function Controller({
  view,
}: GameControllerProps<ImposterControllerView>): React.JSX.Element {
  return <div>{view.phaseId}</div>;
}
