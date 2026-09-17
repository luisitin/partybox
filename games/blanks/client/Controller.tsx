// Controller (phone) view for Blanks: pick from your hand during "answer", read along during
// "reveal", vote during "judge", see the result — the phone carries the same cards as the TV from
// the reveal on, so the game plays with no TV in the room. `send` is the only way out; the server
// validates with inputSchema before reduce sees the input.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, Scoreboard, Screen, WaitingScreen, useSound } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard, LETTERS } from './Cards';
import { ControllerHand } from './ControllerHand';
import { ControllerJudge, ControllerReveal } from './ControllerJudge';
import { winnerLine } from './TvResult';
import styles from './blanks.module.css';

type Props = GameControllerProps<BlanksControllerView, Input>;

function ControllerIntro({ view, me }: Props): JSX.Element {
  const judge = view.czar;
  const meJudge = judge?.id === me.id;
  return (
    <WaitingScreen
      title={`Round ${view.round} of ${view.rounds}`}
      hint={
        meJudge
          ? 'You judge this round — sit back and read the cards.'
          : judge
            ? `${judge.name} judges this round.`
            : view.round === view.rounds
              ? 'Last round. Play your worst.'
              : 'Everyone votes. Play your worst.'
      }
      mood="wait"
    >
      {judge && !meJudge ? (
        <span className={styles.judgeChip}>
          <Avatar avatarId={judge.avatarId} size="var(--pb-chip-size)" />
          {judge.name}
        </span>
      ) : null}
    </WaitingScreen>
  );
}

function ControllerResult({ view, me }: Props): JSX.Element {
  const play = useSound();
  const final = view.phaseId === 'done';
  useEffect(() => {
    if (view.iWon) play('correct');
  }, [view.iWon, play]);
  const winners = view.revealed.filter((r) => r.winner);
  const mine = view.revealed.find((r) => r.submitterId === me.id);
  const rankLine = `${final ? 'Final: ' : ''}#${view.myRank} of ${view.standings.length} · ${view.myScore} ${view.myScore === 1 ? 'point' : 'points'}`;
  return (
    <Screen title={final ? 'Final scores' : `Round ${view.round} of ${view.rounds}`}>
      <div className={styles.resultHero} role="status" aria-live="polite">
        <h2 className={styles.resultLine}>
          {final ? rankLine : view.iWon ? 'You won the round!' : winnerLine(view)}
        </h2>
        {!final ? (
          <p className="pb-caption pb-muted">
            {view.iWon ? '+1 · ' : ''}
            {rankLine}
          </p>
        ) : null}
      </div>
      {!final && view.black && winners.length > 0
        ? winners.map((w) => (
            <FilledCard
              key={w.slot}
              text={view.black?.text ?? ''}
              whites={w.whites}
              size="phone"
              letter={LETTERS[w.slot]}
              winner
            >
              <span className={styles.author}>
                <Avatar avatarId={w.avatarId} size="var(--pb-chip-size)" />
                <span className={styles.authorName}>{w.name}</span>
                {w.votes > 0 ? (
                  <span className={styles.voteCount}>
                    {w.votes} {w.votes === 1 ? 'vote' : 'votes'}
                  </span>
                ) : null}
              </span>
            </FilledCard>
          ))
        : null}
      {!final && mine && !mine.winner ? (
        <p className="pb-caption pb-muted">
          Yours ({LETTERS[mine.slot]}) got {mine.votes} {mine.votes === 1 ? 'vote' : 'votes'}.
        </p>
      ) : null}
      <Scoreboard compact highlightId={me.id} rows={view.standings} noTrophy />
    </Screen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  switch (view.phaseId) {
    case 'intro':
      return <ControllerIntro {...props} />;
    case 'answer':
      return <ControllerHand {...props} />;
    case 'reveal':
      return <ControllerReveal {...props} />;
    case 'judge':
      return <ControllerJudge {...props} />;
    case 'result':
    case 'done':
      return <ControllerResult {...props} />;
    default:
      return <WaitingScreen title="Look at the TV" mood="watch" />;
  }
}
