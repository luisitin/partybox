// Controller (phone) view for Wisecrack: write during "answer", vote during "vote", otherwise a
// calm waiting screen with your own result. `send` is the only way out; the server validates
// with inputSchema before reduce sees the input.
import { useState } from 'react';
import type { JSX } from 'react';
import { Scoreboard, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import { ControllerAnswer } from './ControllerAnswer';
import { ControllerReveal, ControllerVote } from './ControllerVote';
import type { LastVote } from './ControllerVote';

type Props = GameControllerProps<WisecrackControllerView, Input>;

// results() ends the game in the same dispatch that enters 'done'; the engine's results screen is
// the ceremony — only the dev fixture preview renders that phase, as the final-scores screen.
function ControllerScores({ view, me }: Props): JSX.Element {
  const final = view.round >= view.rounds;
  return (
    <WaitingScreen
      title={final ? `Your final score: ${view.myScore}` : `You have ${view.myScore} points`}
      hint={
        final
          ? `#${view.myRank} · +${view.myDelta} in the final round`
          : `#${view.myRank} · +${view.myDelta} this round`
      }
      mood="watch"
    >
      <Scoreboard compact highlightId={me.id} rows={view.standings} />
    </WaitingScreen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  // A voter's pick, remembered into the reveal (ControllerVote unmounts at the phase change).
  // Server-confirmed (votedSlot), so a rejected or late tap never shows a stale pick; cleared the
  // moment a new prompt's vote opens — "adjust state when a prop changes", in render.
  const [lastVote, setLastVote] = useState<LastVote | null>(null);
  const vote = view.vote;
  if (vote) {
    const next: LastVote | null =
      vote.votedSlot === null
        ? null
        : {
            promptId: vote.promptId,
            slot: vote.votedSlot,
            text: vote.options[vote.votedSlot]?.text ?? '',
          };
    if (next?.promptId !== lastVote?.promptId || next?.slot !== lastVote?.slot) setLastVote(next);
  }
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
      return <ControllerReveal {...props} lastVote={lastVote} />;
    case 'scores':
    case 'done':
      return <ControllerScores {...props} />;
    default:
      return <WaitingScreen title="Look at the TV" mood="watch" />;
  }
}
