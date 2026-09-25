// Controller (phone) view for Wisecrack: write during "answer", vote during "vote", otherwise a
// calm waiting screen with your own result. `send` is the only way out; the server validates
// with inputSchema before reduce sees the input.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Scoreboard, Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import { ControllerAnswer } from './ControllerAnswer';
import { ControllerReveal, ControllerVote } from './ControllerVote';
import type { LastVote } from './ControllerVote';
import { STRINGS } from './strings';
import { useCountUp } from './timing';
import styles from './wisecrack.module.css';

type Props = GameControllerProps<WisecrackControllerView, Input>;

/** Mirrors --pb-motion-slow (CSS tokens are not readable from JS). */
const COUNT_MS = 600;

// results() ends the game in the same dispatch that enters 'done'; the engine's results screen is
// the ceremony — only the dev fixture preview renders that phase, as the final-scores screen.
// The board is the point of this screen, so no mood disc: the round's delta is the hero, then my
// rank, then the compact board with a numeric rank (the crown is the results screen's).
function ControllerScores({ view, me, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const final = view.round >= view.rounds;
  // Pacing rule (2026-09-25): between rounds the board waits for the VIP's Next (a long fallback
  // on the server); one tap locks the button so a double tap never skips two phases.
  const [sent, setSent] = useState(false);
  const next =
    !final && view.phaseId === 'scores' && skip ? (
      <PrimaryButton
        tone="neutral"
        done={sent}
        onClick={() => {
          if (sent) return;
          setSent(true);
          skip();
        }}
      >
        {sent ? L('Moving on…') : L('Next round')}
      </PrimaryButton>
    ) : undefined;
  // The delta counts up from 0 and the total from the previous score (one --pb-motion-slow).
  const delta = useCountUp(view.myDelta, 0, COUNT_MS);
  const score = useCountUp(view.myScore, view.myScore - view.myDelta, COUNT_MS);
  // Everyone level (a 0–0 round, say) is not "#1 of 4": say tied (review-loop #35).
  const allTied =
    view.standings.length > 1 && view.standings.every((s) => s.score === view.standings[0]?.score);
  const place = allTied
    ? L('all tied')
    : L('#{rank} of {count}', { rank: view.myRank, count: view.standings.length });
  const rankLine = final
    ? L('Final: {place} · {score} points', { place, score })
    : L('{place} · {score} points', { place, score });
  return (
    <Screen footer={next}>
      <div className={styles.scoresHero} role="status" aria-live="polite">
        {view.myDelta === 0 ? (
          // Nothing to count up: the rank is the news, and a giant grey "+0" is not (review-loop #31).
          <>
            <h2 className={styles.rankHero}>{rankLine}</h2>
            <p className="pb-caption pb-muted">
              {view.rounds === 1
                ? L('No points this game')
                : final
                  ? L('No points in the final round')
                  : L('No points this round')}
            </p>
          </>
        ) : (
          <>
            <p
              className={styles.deltaHero}
              aria-label={
                final
                  ? L('+{n} points in the final round', { n: view.myDelta })
                  : L('+{n} points this round', { n: view.myDelta })
              }
            >
              +{delta}
            </p>
            <h2 className={styles.rankLine}>{rankLine}</h2>
          </>
        )}
      </div>
      <Scoreboard compact highlightId={me.id} rows={view.standings} noTrophy />
    </Screen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  const L = useT(STRINGS);
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
          title={L('Round {round} of {rounds}', { round: view.round, rounds: view.rounds })}
          hint={
            view.multiplier > 1
              ? L('Final round: every vote is worth double!')
              : L('Get ready to write…')
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
      return (
        <WaitingScreen
          title={view.phoneOnly ? L('One moment…') : L('Look at the TV')}
          mood="watch"
        />
      );
  }
}
