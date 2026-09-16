// Controller (phone) view for Bingo: the current call on top, your tappable card in the middle,
// the BINGO! button pinned to the bottom. `send` is the only way out; the server accepts every
// daub (no validation — that is the game) and judges only the claim.
import type { JSX } from 'react';
import { PrimaryButton, Scoreboard, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps, ScoreboardRow } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BingoControllerView, CallView } from '../server/views';
import { Card, PatternIcon } from './Card';
import styles from './Controller.module.css';

function rows(view: BingoControllerView): ScoreboardRow[] {
  const avatar = (id: string): string => view.players.find((p) => p.id === id)?.avatarId ?? '';
  return view.standings.map((s) => ({
    playerId: s.playerId,
    name: s.name,
    avatarId: avatar(s.playerId),
    score: s.wins,
    rank: s.rank,
  }));
}

function CallHeader({
  current,
  previous,
  index,
}: {
  current: CallView | null;
  previous: CallView | null;
  index: number;
}): JSX.Element {
  if (!current) return <div className={styles.header} />;
  return (
    <div className={styles.header} role="status" aria-live="polite">
      <div className={styles.now} key={current.number}>
        <span className={styles.letter}>{current.letter}</span>
        <span className={styles.number}>{current.number}</span>
        <span className={styles.phrase}>{current.call}</span>
      </div>
      <div className={styles.meta}>
        <span>call {index}</span>
        {previous ? (
          <span>
            before: {previous.letter} {previous.number}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Controller({
  view,
  me,
  send,
}: GameControllerProps<BingoControllerView, Input>): JSX.Element {
  const card = view.card;
  if (!card) {
    return (
      <WaitingScreen
        title="You're watching this one"
        hint={
          view.current
            ? `${view.current.letter} ${view.current.number} — ${view.current.call}. Called so far: ${view.called.join(', ')}`
            : 'You get a card next game.'
        }
        mood="watch"
      />
    );
  }

  if (view.phaseId === 'intro') {
    return (
      <Screen title={`Round ${view.round} of ${view.totalRounds}`}>
        <div className={styles.intro}>
          <PatternIcon cells={view.patternCells} size={72} />
          <div>
            <p className={styles.patternLabel}>{view.patternLabel}</p>
            <p className={styles.hint}>{view.patternHint}</p>
          </div>
        </div>
        <p className={styles.hint}>Your new card. Daub what you hear — tap again to undo.</p>
        <Card
          numbers={card}
          daubs={[]}
          pattern={view.pattern === 'line' ? [] : view.patternCells}
          disabled
        />
      </Screen>
    );
  }

  if (view.phaseId === 'play' || view.phaseId === 'check') {
    const checking = view.phaseId === 'check';
    const claim = view.claim;
    const mine = checking && claim?.playerId === me.id;
    const label = mine
      ? 'Not a bingo — card wiped'
      : checking
        ? `${claim?.name ?? 'Someone'} says BINGO! — look at the TV`
        : view.waitingForCall
          ? 'Wait for the next number…'
          : 'BINGO!';
    return (
      <Screen
        footer={
          <PrimaryButton
            tone={mine ? 'danger' : 'accent'}
            disabled={!view.canClaim}
            onClick={() => send({ type: 'bingo' })}
            className={styles.bingo}
          >
            {label}
          </PrimaryButton>
        }
      >
        <CallHeader current={view.current} previous={view.previous} index={view.callIndex} />
        <Card numbers={card} daubs={view.daubs} onTap={(index) => send({ type: 'daub', index })} />
        <p className={styles.patternLine}>
          <PatternIcon cells={view.patternCells} size={28} /> {view.patternLabel}
        </p>
      </Screen>
    );
  }

  if (view.phaseId === 'bingo') {
    const iWon = view.winnerId === me.id;
    const claim = view.claim;
    return (
      <Screen
        title={
          iWon
            ? `BINGO! You win round ${view.round}`
            : view.winnerName
              ? `${view.winnerName} has bingo`
              : 'No bingo this round'
        }
      >
        {iWon && claim ? (
          <Card numbers={claim.card} daubs={claim.daubs} green={claim.green} disabled />
        ) : (
          <Card numbers={card} daubs={view.daubs} disabled />
        )}
        <p className={styles.hint}>
          {view.round < view.totalRounds ? 'Fresh cards next round.' : 'That was the last round.'}
        </p>
      </Screen>
    );
  }

  if (view.phaseId === 'scoreboard') {
    return (
      <Screen title="Rounds won">
        <Scoreboard rows={rows(view)} compact highlightId={me.id} noTrophy />
        <p className={styles.hint}>
          Next: round {view.round + 1} — {view.patterns[view.round] ?? ''}
        </p>
      </Screen>
    );
  }

  const myRank = view.standings.find((s) => s.playerId === me.id)?.rank ?? null;
  return (
    <Screen
      title={myRank === 1 ? 'You won!' : myRank ? `You finished #${myRank}` : 'Thanks for playing'}
    >
      <Scoreboard rows={rows(view)} compact highlightId={me.id} />
    </Screen>
  );
}
