// Controller (phone) view for Blanks: pick from your hand during "answer", read along during
// "reveal", vote during "judge", see the result — the phone carries the same cards as the TV from
// the reveal on, so the game plays with no TV in the room. `send` is the only way out; the server
// validates with inputSchema before reduce sees the input.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  Scoreboard,
  Screen,
  WaitingScreen,
  useBeats,
  useSound,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard, LETTERS } from './Cards';
import { ControllerHand, ControllerPick } from './ControllerHand';
import { ControllerJudge, ControllerReveal } from './ControllerJudge';
import { NextButton } from './NextButton';
import { RESULT_BEATS_MS, list, votesLabel, winnerLine } from './TvResult';
import { rankLine } from './rankLine';
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
      {/* Somebody is on a run — the same line the TV's round card carries (review-loop #236). */}
      {view.streak ? (
        <p className="pb-caption">
          {view.streak.name} is on a {view.streak.runs}-round streak
        </p>
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

function ControllerResult({ view, me, skip }: Props): JSX.Element {
  const play = useSound();
  const final = view.phaseId === 'final' || view.phaseId === 'done';
  // The TV names the winner on its third beat (1.2 s). The phone used to say "You won the round!"
  // and chime the moment the result opened, which spoiled the TV's crown by more than a second for
  // anyone holding a phone (review-loop #222). Both now wait for the same beat; with no TV in the
  // room it is simply a beat.
  const beat = useBeats(RESULT_BEATS_MS);
  // A round nobody won has no crown to spoil, so the phone says so at once instead of holding a
  // near-empty screen for a beat and a bit (review-loop #332).
  const nothingToReveal = view.revealed.every((r) => !r.winner);
  const named = final || nothingToReveal || beat >= 2;
  useEffect(() => {
    if (view.iWon && named) play('correct');
  }, [view.iWon, named, play]);
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
  const standing = rankLine(view, final);
  // I-151 B: the footer shares the phone with the winner card, so it shows three rows — mine and
  // its neighbours — and SAYS how many are missing: a ranked list is only trustworthy when it is
  // clearly complete or clearly truncated. (FIRST BUILD: five rows, so in a five-player room B
  // never cut anything and looked exactly like A — audit 2026-09-22.)
  const FITS = 3;
  const [showAll, setAll] = useState(false);
  const mineAt = view.standings.findIndex((r) => r.playerId === me.id);
  const windowed =
    view.standings.length <= FITS || showAll
      ? view.standings
      : view.standings.slice(
          Math.max(0, Math.min(mineAt - 1, view.standings.length - FITS)),
          Math.max(FITS, Math.min(mineAt - 1, view.standings.length - FITS) + FITS),
        );
  const boardRows = windowed;
  const hidden = view.standings.length - windowed.length;
  return (
    <Screen
      title={final ? 'Final scores' : `Round ${view.round} of ${view.rounds}`}
      // Untimed rounds: the result stays up until the VIP moves on.
      footer={
        <>
          {/* I-151 A: the standings are a constant footer, not the last thing in a body that may
              never be scrolled — on a split result the winner cards used to fill the screen and
              the board never came into view. */}
          {view.standings.length > 0 ? (
            <div className={`${styles.resultBoard} ${named || final ? '' : styles.beatWait}`.trim()}>
              <Scoreboard compact highlightId={me.id} rows={boardRows} noTrophy />
              {hidden > 0 ? (
                <button type="button" className={styles.moreRows} onClick={() => setAll((v) => !v)}>
                  {showAll ? 'show fewer' : `and ${hidden} more`}
                </button>
              ) : null}
            </div>
          ) : null}
          {final ? null : (
            <NextButton
              skip={skip}
              timed={view.timed}
              label={view.round < view.rounds ? 'Next round' : 'Final scores'}
            />
          )}
        </>
      }
    >
      <div className={styles.resultHero} role="status" aria-live="polite">
        {/* The line keeps its place and fades in on the winner beat, the way the TV's headline
            does: writing "Round n of m" here instead repeated the screen's own title (loop #229),
            and rendering nothing made the card jump when the line arrived. Hidden from screen
            readers until it is true, or the room hears the winner before the TV names them. */}
        <h2
          className={`${styles.resultLine} ${final || named ? '' : styles.beatWait}`.trim()}
          aria-hidden={!final && !named}
        >
          {final ? standing : view.iWon ? wonLine : (iPicked ?? winnerLine(view))}
        </h2>
        {/* The "+1" and your new place belong to the same reveal: before the winner beat they give
            the headline away (review-loop #222). */}
        {!final && named ? (
          <p className="pb-caption pb-muted">
            {view.iWon ? '+1 · ' : ''}
            {standing}
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
              {/* The TV lands the authors on its second beat (600 ms) and the phone now waits with
                  it, keeping its place so the card does not resize (review-loop #226). */}
              <span
                className={`${styles.author} ${final || beat >= 1 ? '' : styles.beatWait}`.trim()}
              >
                <Avatar avatarId={w.avatarId} size="var(--pb-chip-size)" />
                <span className={styles.authorName}>{w.name}</span>
                {votesLabel(view, w.votes) ? (
                  <span className={styles.voteCount}>{votesLabel(view, w.votes)}</span>
                ) : null}
              </span>
              {/* A phone-only room sees the social payoff too (review-loop #170). */}
              {view.judgeMode === 'vote' && w.voters.length > 0 ? (
                // The gate sits on a wrapper: `.voters` runs pb-rise with fill `both`, and an
                // animation's own opacity beats a class's (the trap from loop #196).
                <span className={final || beat >= 1 ? '' : styles.beatWait}>
                  <span className={`${styles.voters} pb-caption`}>
                    Voted by {list(w.voters.map((v) => v.name))}
                  </span>
                </span>
              ) : null}
            </FilledCard>
          ))
        : null}
      {/* Your own card's line, on the winner's beat with everything else. Votes you did get are
          worth a name: "got 2 votes — Priya and Sam" is the thing people lean over to say out loud
          (review-loop #226); a judge's round has no votes to name. */}
      {!final && named && mine && !mine.winner ? (
        <p className="pb-caption pb-muted">
          {view.judgeMode === 'czar'
            ? `Yours (${LETTERS[mine.slot]}) wasn't picked.`
            : `Yours (${LETTERS[mine.slot]}) got ${mine.votes} ${mine.votes === 1 ? 'vote' : 'votes'}${
                mine.voters.length > 0 ? ` — ${list(mine.voters.map((v) => v.name))}` : ''
              }.`}
        </p>
      ) : null}
      {/* The point is already in the standings when the result opens, and the TV holds its own
          strip back until the winner is named (`stripScores`). The phone's board keeps its place
          and fades in on the same beat, so nothing counts up before the reveal (loop #222). */}
      {/* I-151 A: the board is in the footer now — see the Screen's `footer` above. */}
      {/* The night's best-liked card, on the phone too (review-loop #193). */}
      {final && view.bestCard ? (
        <div className={styles.bestCard}>
          <p className={styles.kicker}>Card of the night</p>
          <FilledCard text={view.bestCard.black} whites={view.bestCard.whites} size="mini" winner>
            <span className={styles.author}>
              <Avatar avatarId={view.bestCard.avatarId} size="var(--pb-chip-size)" />
              <span className={styles.authorName}>{view.bestCard.name}</span>
              {view.judgeMode === 'czar' ? null : (
                <span className={styles.voteCount}>
                  {view.bestCard.votes} {view.bestCard.votes === 1 ? 'vote' : 'votes'}
                </span>
              )}
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
      return (
        <WaitingScreen title={view.phoneOnly ? 'One moment…' : 'Look at the TV'} mood="watch" />
      );
  }
}
