// Controller (phone) view for Wisecrack: write during "answer", vote during "vote", otherwise a
// calm waiting screen with your own result. `send` is the only way out; the server validates
// with inputSchema before reduce sees the input.
import { useState } from 'react';
import type { JSX } from 'react';
import { Scoreboard, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import { ControllerAnswer } from './ControllerAnswer';
import { ControllerReveal, ControllerVote } from './ControllerVote';
import type { LastVote } from './ControllerVote';
import { useCountUp } from './timing';
import styles from './wisecrack.module.css';

type Props = GameControllerProps<WisecrackControllerView, Input>;

/** Mirrors --pb-motion-slow (CSS tokens are not readable from JS). */
const COUNT_MS = 600;

// results() ends the game in the same dispatch that enters 'done'; the engine's results screen is
// the ceremony — only the dev fixture preview renders that phase, as the final-scores screen.
// The board is the point of this screen, so no mood disc: the round's delta is the hero, then my
// rank, then the compact board with a numeric rank (the crown is the results screen's).
function ControllerScores({ view, me }: Props): JSX.Element {
  const final = view.round >= view.rounds;
  // The delta counts up from 0 and the total from the previous score (one --pb-motion-slow).
  const delta = useCountUp(view.myDelta, 0, COUNT_MS);
  const score = useCountUp(view.myScore, view.myScore - view.myDelta, COUNT_MS);
  return (
    <Screen>
      <div className={styles.scoresHero} role="status" aria-live="polite">
        <p
          className={styles.deltaHero}
          data-zero={view.myDelta === 0 || undefined}
          aria-label={`+${view.myDelta} points ${final ? 'in the final round' : 'this round'}`}
        >
          +{delta}
        </p>
        <h2 className={styles.rankLine}>
          {final ? 'Final: ' : ''}#{view.myRank} of {view.standings.length} · {score} points
        </h2>
      </div>
      <Scoreboard compact highlightId={me.id} rows={view.standings} noTrophy />
    </Screen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  // A voter's pick, remembered into the reveal (ControllerVote unmounts at the phase change).
  // Set on the tap — the last vote ends the phase in the same reduce, so that phone never sees a
  // confirmed votedSlot — overwritten by the server's confirmation when one arrives, and cleared
  // the moment a new prompt's vote opens: "adjust state when a prop changes", in render.
  const [lastVote, setLastVote] = useState<LastVote | null>(null);
  const vote = view.vote;
  if (vote) {
    if (lastVote && lastVote.promptId !== vote.promptId) setLastVote(null);
    else if (vote.votedSlot !== null && lastVote?.slot !== vote.votedSlot)
      setLastVote({
        promptId: vote.promptId,
        slot: vote.votedSlot,
        text: vote.options[vote.votedSlot]?.text ?? '',
      });
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
      return <ControllerVote {...props} onPick={setLastVote} />;
    case 'reveal':
      return <ControllerReveal {...props} lastVote={lastVote} />;
    case 'scores':
    case 'done':
      return <ControllerScores {...props} />;
    default:
      return <WaitingScreen title="Look at the TV" mood="watch" />;
  }
}
