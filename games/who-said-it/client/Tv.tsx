// TV for Who Said It: one component per phase, dumb by design (renders `view`). The shell draws
// the timer, the strip and the VIP overlay; the reader's lines play from here (useSay).
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WsTvView } from '../server/views';
import { TvGuess } from './TvGuess';
import { TvReveal } from './TvReveal';
import { TvScores } from './TvScores';
import { TvPrompt, TvWrite } from './TvTitles';
import { useSay } from './useSay';

export function Tv({ view }: GameTvProps<WsTvView>): JSX.Element {
  useSay(view.say, view.startedAt, view.phaseId, view.deadline);
  switch (view.phaseId) {
    case 'prompt':
      return <TvPrompt view={view} />;
    case 'write':
      return <TvWrite view={view} />;
    case 'guess':
      return <TvGuess view={view} />;
    case 'reveal':
      return <TvReveal view={view} />;
    case 'scores':
    case 'done':
      return <TvScores view={view} />;
    default:
      return (
        <Stage center>
          <BigText tone="muted">…</BigText>
        </Stage>
      );
  }
}
