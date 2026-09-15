// Controller (phone) view for Wisecrack: write during "answer", vote during "vote", otherwise a
// calm waiting screen with your own result. `send` is the only way out; the server validates
// with inputSchema before reduce sees the input.
import type { JSX } from 'react';
import { Scoreboard, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import { ControllerAnswer } from './ControllerAnswer';
import { ControllerReveal, ControllerVote } from './ControllerVote';

type Props = GameControllerProps<WisecrackControllerView, Input>;

function ControllerScores({ view, me }: Props): JSX.Element {
  const done = view.phaseId === 'done';
  return (
    <WaitingScreen
      title={done ? 'Thanks for playing!' : `You have ${view.myScore} points`}
      hint={
        done
          ? `You finished #${view.myRank} with ${view.myScore} points.`
          : `#${view.myRank} · +${view.myDelta} this round`
      }
      mood={done ? 'done' : 'watch'}
    >
      <Scoreboard compact highlightId={me.id} rows={view.standings} />
    </WaitingScreen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  switch (view.phaseId) {
    case 'intro':
      return (
        <WaitingScreen
          title={`Round ${view.round} of ${view.rounds}`}
          hint={
            view.multiplier > 1 ? 'Final round: every vote is worth double!' : 'Get ready to write…'
          }
          mood="wait"
        />
      );
    case 'answer':
      return <ControllerAnswer {...props} />;
    case 'vote':
      return <ControllerVote {...props} />;
    case 'reveal':
      return <ControllerReveal {...props} />;
    case 'scores':
    case 'done':
      return <ControllerScores {...props} />;
    default:
      return <WaitingScreen title="Look at the TV" mood="watch" />;
  }
}
