// I-105: after a bingo every phone votes (keep going / blackout / next round). B: who has voted for
// what, in one line on the TV; C: the vote's clock, on the TV and on the phone's hint line.
import type { JSX } from 'react';
import { PrimaryButton, buzz, useSecondsLeft, useSound, useT } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { pendingLine } from './copy';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

type Send = (input: Input) => void;

type Choice = 'same' | 'blackout' | 'next';

/** I-105 B: who has voted for what, in one line ("Sam: blackout · Priya: fresh cards"). */
export function VoteTally({
  votes,
  className,
}: {
  votes: { name: string; choice: Choice }[];
  className?: string;
}): JSX.Element | null {
  const L = useT(STRINGS);
  if (votes.length === 0) return null;
  const say = (c: Choice): string =>
    c === 'next' ? L('fresh cards') : c === 'blackout' ? L('blackout') : L('same pattern');
  return (
    <span className={className} role="status">
      {votes.map((v) => `${v.name}: ${say(v.choice)}`).join(' · ')}
    </span>
  );
}

/** I-105 C: the vote's clock — "Vote closes in 4" once someone has voted. */
export function VoteClock({
  endsAt,
  changeable = false,
}: {
  endsAt: number | null;
  /** On the phone, once I have voted: "tap another to change it" rides on the same line. */
  changeable?: boolean;
}): JSX.Element | null {
  const left = useSecondsLeft(endsAt);
  const L = useT(STRINGS);
  if (endsAt === null || left === null) return null;
  return (
    <span className={styles.voteClock} role="timer">
      {left > 0
        ? changeable
          ? L('Vote closes in {n} — tap another to change it', { n: left })
          : L('Vote closes in {n}', { n: left })
        : L('Counting the votes…')}
    </span>
  );
}

/** After a bingo: keep going on the same cards (same pattern / blackout) or move on. */
export function DecideFooter({
  view,
  send,
}: {
  view: BingoControllerView;
  send: Send;
}): JSX.Element | null {
  const decide = view.decide;
  const play = useSound();
  const L = useT(STRINGS);
  if (!decide) return null;
  // A choice already made mid-celebration: the buttons go, the phone says what starts when.
  const lastRound = view.round >= view.totalRounds;
  const pending = pendingLine(view.pendingDecision, lastRound, view.pendingBy, L);
  if (pending) return <p className={styles.hint}>{pending}</p>;
  const nextLabel = lastRound ? L('Finish the game') : L('Next round — fresh cards');
  // I-105 B: how many have voted for each choice, on the button itself (" · 2").
  const tallyOf = (choice: 'same' | 'blackout' | 'next'): string => {
    const n = view.votes.filter((v) => v.choice === choice).length;
    return n > 0 ? ` · ${n}` : '';
  };
  // The pick lands in the hand (loop 322): a 'submit' cue and a short buzz on the tap itself —
  // every other tap in the game sounds; the room's choice did not.
  const pick = (input: Input): void => {
    buzz(20);
    play('submit');
    send(input);
  };
  return (
    <div className={styles.decide}>
      {/* I-105 A: a vote — the buttons stay until it closes; my choice is lit and can change. */}
      {decide.same ? (
        <PrimaryButton
          className={view.myVote === 'same' ? styles.voted : undefined}
          onClick={() => pick({ type: 'continue', pattern: 'same' })}
        >
          {view.myVote === 'same' ? '✓ ' : ''}
          {L('Keep going — same pattern')}
          {tallyOf('same')}
        </PrimaryButton>
      ) : null}
      {decide.blackout ? (
        <PrimaryButton
          tone="neutral"
          className={view.myVote === 'blackout' ? styles.voted : undefined}
          onClick={() => pick({ type: 'continue', pattern: 'blackout' })}
        >
          {view.myVote === 'blackout' ? '✓ ' : ''}
          {L('Keep going — blackout')}
          {tallyOf('blackout')}
        </PrimaryButton>
      ) : null}
      <PrimaryButton
        tone="neutral"
        className={view.myVote === 'next' ? styles.voted : undefined}
        onClick={() => pick({ type: 'next' })}
      >
        {view.myVote === 'next' ? '✓ ' : ''}
        {nextLabel}
        {tallyOf('next')}
      </PrimaryButton>
      {/* (SECOND BUILD: B's tally and C's clock were extra lines under the buttons, which pushed
          them under the phone's "more below" arrow; now the counts ride on the buttons and the
          clock takes the hint line, so the screen is as tall as A's.) */}
      <p className={styles.hint}>
        <VoteClock endsAt={view.voteEndsAt} changeable={view.myVote !== null} />
        {view.voteEndsAt !== null
          ? null
          : view.myVote
            ? L('Your vote is in — tap another to change it.')
            : L('Everyone votes; the most votes win.')}
      </p>
    </div>
  );
}

/** I-400 B: nobody has picked yet — when the room moves on by itself. */
export function NoPickClock({
  endsAt,
  last,
}: {
  endsAt: number | null;
  last: boolean;
}): JSX.Element | null {
  const left = useSecondsLeft(endsAt);
  const L = useT(STRINGS);
  if (endsAt === null || left === null || left > 20) return null;
  return (
    <span className={styles.voteClock} role="timer">
      {last ? L('Finishing in {n}', { n: left }) : L('Next round in {n}', { n: left })}
    </span>
  );
}
