// TV view for Quick Poll. Dumb component: renders `view`, composes game-sdk primitives, never
// touches sockets or game logic. The shell already shows the timer and player chips.
import type { JSX } from 'react';
import { BigText, Reveal, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { QuickPollTvView } from '../server/index';

export function Tv({ view }: GameTvProps<QuickPollTvView>): JSX.Element {
  if (view.phaseId === 'answer') {
    return (
      <Stage center>
        <BigText level="display">{view.prompt}</BigText>
        <BigText level="h2" tone="muted">
          {view.answeredCount} / {view.totalCount} answered
        </BigText>
      </Stage>
    );
  }
  return (
    <Stage>
      <BigText level="h2" tone="muted">
        {view.prompt}
      </BigText>
      <Reveal
        items={view.answers.map((a) => ({ id: a.playerId, text: a.text, detail: a.name }))}
        stepMs={view.phaseId === 'done' ? 0 : 500}
      />
      {view.phaseId === 'done' ? <BigText tone="accent">That's the poll!</BigText> : null}
    </Stage>
  );
}
