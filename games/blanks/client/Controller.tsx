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
import { ControllerHand, ControllerPick } from './ControllerHand';
import { ControllerJudge, ControllerReveal } from './ControllerJudge';
import { NextButton } from './NextButton';
import { list, votesLabel, winnerLine } from './TvResult';
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
      {/* Round 2 on: where I stand, on the same beat as the TV's board (review-loop #164). */}
      {view.standings.length > 0 ? (
        <p className="pb-caption pb-muted">
          You&apos;re #{view.myRank} of {view.standings.length} · {view.myScore}{' '}
          {view.myScore === 1 ? 'point' : 'points'}
        </p>
      ) : null}
    </WaitingScreen>
  );
}

function ControllerResult({ view, me, send }: Props): JSX.Element {
  const play = useSound();
  const final = view.phaseId === 'final' || view.phaseId === 'done';
  useEffect(() => {
    if (view.iWon) play('correct');
  }, [view.iWon, play]);
  const winners = view.revealed.filter((r) => r.winner);
  const mine = view.revealed.find((r) => r.submitterId === me.id);
  // The judge's own phone: their pick, by name (they had no card in the round).
  const iPicked =
    view.role === 'judge' && winners.length === 1 && !winners[0]?.rando
      ? `You picked ${winners[0]?.name}`
      : null;
  const others = winners.filter((w) => w.submitterId !== me.id).map((w) => w.name);
  const noVotes = view.revealed.every((r) => r.votes === 0);
  // A shared point says so: a formality split (two cards, no one else to vote) or a tie.
  const wonLine =
    winners.length === 1
      ? 'You won the round!'
      : winners.length === 2 && noVotes
        ? 'Only two cards — you both score'
        : `You split it with ${list(others)}`;
  const rankLine = `${final ? 'Final: ' : ''}#${view.myRank} of ${view.standings.length} · ${view.myScore} ${view.myScore === 1 ? 'point' : 'points'}`;
  return (
    <Screen
      title={final ? 'Final scores' : `Round ${view.round} of ${view.rounds}`}
      // Untimed rounds: the result stays up until someone in the room moves on.
      footer={
        final ? undefined : (
          <NextButton
            send={send}
            timed={view.timed}
            label={view.round < view.rounds ? 'Next round' : 'Final scores'}
          />
        )
      }
    >
      <div className={styles.resultHero} role="status" aria-live="polite">
        <h2 className={styles.resultLine}>
          {final ? rankLine : view.iWon ? wonLine : (iPicked ?? winnerLine(view))}
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
              // A split shows every winner: thumbnails, so two or three fit an 8 s timed result without
              // scrolling (review-loop #120).
              size={winners.length > 1 ? 'mini' : 'phone'}
              letter={LETTERS[w.slot]}
              winner
            >
              <span className={styles.author}>
                <Avatar avatarId={w.avatarId} size="var(--pb-chip-size)" />
                <span className={styles.authorName}>{w.name}</span>
                {votesLabel(view, w.votes) ? (
                  <span className={styles.voteCount}>{votesLabel(view, w.votes)}</span>
                ) : null}
              </span>
              {/* A phone-only room sees the social payoff too (review-loop #170). */}
              {view.judgeMode === 'vote' && w.voters.length > 0 ? (
                <span className={`${styles.voters} pb-caption`}>
                  Voted by {list(w.voters.map((v) => v.name))}
                </span>
              ) : null}
            </FilledCard>
          ))
        : null}
      {!final && mine && !mine.winner ? (
        <p className="pb-caption pb-muted">
          {view.judgeMode === 'czar'
            ? `Yours (${LETTERS[mine.slot]}) wasn't picked.`
            : `Yours (${LETTERS[mine.slot]}) got ${mine.votes} ${mine.votes === 1 ? 'vote' : 'votes'}.`}
        </p>
      ) : null}
      <Scoreboard compact highlightId={me.id} rows={view.standings} noTrophy />
      {/* The night's best-liked card, on the phone too (review-loop #193). */}
      {final && view.bestCard ? (
        <div className={styles.bestCard}>
          <p className={styles.kicker}>Card of the night</p>
          <FilledCard text={view.bestCard.black} whites={view.bestCard.whites} size="mini" winner>
            <span className={styles.author}>
              <Avatar avatarId={view.bestCard.avatarId} size="var(--pb-chip-size)" />
              <span className={styles.authorName}>{view.bestCard.name}</span>
              <span className={styles.voteCount}>
                {view.bestCard.votes} {view.bestCard.votes === 1 ? 'vote' : 'votes'}
              </span>
              <span className={styles.bestRound}>round {view.bestCard.round}</span>
            </span>
          </FilledCard>
        </div>
      ) : null}
    </Screen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  switch (view.phaseId) {
    case 'intro':
      return <ControllerIntro {...props} />;
    case 'pick':
      return <ControllerPick {...props} />;
    case 'answer':
      return <ControllerHand {...props} />;
    case 'reveal':
      return <ControllerReveal {...props} />;
    case 'judge':
      return <ControllerJudge {...props} />;
    case 'result':
    case 'final':
    case 'done':
      return <ControllerResult {...props} />;
    default:
      return <WaitingScreen title="Look at the TV" mood="watch" />;
  }
}
