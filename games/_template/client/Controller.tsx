// Controller (phone) view for Quick Poll: a TextAnswer during "answer", a waiting screen after.
// `send` is the only way out; the server validates with inputSchema before reduce sees it.
import type { JSX } from 'react';
import { TextAnswer, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { QuickPollControllerView } from '../server/index';
import type { Input } from '../server/types';

export function Controller({
  view,
  send,
}: GameControllerProps<QuickPollControllerView, Input>): JSX.Element {
  if (view.phaseId === 'answer') {
    return (
      <TextAnswer
        kicker="Quick Poll"
        prompt={view.prompt}
        placeholder="One word…"
        maxLength={24}
        submitted={view.submitted}
        promptKey={`${view.phaseId}:${view.deadline ?? ''}`}
        onSubmit={(text) => send({ type: 'answer', text })}
      />
    );
  }
  return (
    <WaitingScreen
      title={view.phaseId === 'done' ? 'Thanks for playing!' : 'Look at the TV'}
      hint={view.myAnswer ? `You said "${view.myAnswer}"` : 'You did not answer this time.'}
      mood={view.myAnswer ? 'done' : 'watch'}
    />
  );
}
