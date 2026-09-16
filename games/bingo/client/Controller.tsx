// Controller (phone) view for Bingo: the current call's NICKNAME on top (the number itself is on
// the TV — the phone never spoils the stage, and the room has to listen to the caller), your
// tappable card in the middle, the BINGO! button pinned to the bottom. `send` is the only way out;
// the server accepts every daub (no validation — that is the game) and judges only the claim.
import { useState } from 'react';
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
        <span className={styles.phrase}>{current.call}</span>
      </div>
      <p className={styles.meta}>
        Call {index} · {pattern} ·{' '}
        {previous ? `before: ${previous.call}` : 'the number is on the TV'}
      </p>
    </div>
  );
}

export function Controller({
  view,
  me,
  send,
}: GameControllerProps<BingoControllerView, Input>): JSX.Element {
  const card = view.card;
  // FREE always counts (server); daubing it is pure satisfaction, so it lives on the phone only
  // and resets with every fresh card (round) — "adjust state when a prop changes", in render.
  const [freeDaubed, setFreeDaubed] = useState(false);
  const [freeRound, setFreeRound] = useState(view.round);
  if (freeRound !== view.round) {
    setFreeRound(view.round);
    setFreeDaubed(false);
  }
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

  if (view.phaseId === 'intro' || view.phaseId === 'play' || view.phaseId === 'check') {
    const intro = view.phaseId === 'intro';
    const checking = view.phaseId === 'check';
    const claim = view.claim;
    const mine = checking && claim?.playerId === me.id;
    // Short: the footer is one line even on a 320 px phone (the TV carries the story).
    const label = mine
      ? 'Not a bingo'
      : checking
        ? 'Look at the TV'
        : view.waitingForCall
          ? 'Next number soon…'
          : 'BINGO!';
    return (
      // One node for intro + play + check (review-loop #2): the card a player just got must not
      // blank and rise again when the first call lands, nor when a claim is checked (freeDaubed
      // lives in this Controller, above the Screen, so it survives either way).
      <Screen
        key="round"
        title={intro ? `Round ${view.round} of ${view.totalRounds}` : undefined}
        footer={
          intro ? undefined : (
            <PrimaryButton
              tone={mine ? 'danger' : 'accent'}
              disabled={!view.canClaim}
              onClick={() => send({ type: 'bingo' })}
              className={styles.bingo}
            >
              {label}
            </PrimaryButton>
          )
        }
      >
        {intro ? (
          // Compact on purpose: icon, name and hint in one block so the whole card fits a 659 px
          // viewport (iPhone 15 in Safari) without scrolling.
          <div className={styles.intro}>
            <PatternIcon cells={view.patternCells} size={48} />
            <div>
              <p className={styles.patternLabel}>{view.patternLabel}</p>
              <p className={styles.hint}>{view.patternHint}</p>
            </div>
          </div>
        ) : (
          <CallHeader current={view.current} previous={view.previous} index={view.callIndex} />
        )}
        {intro ? (
          <p className={styles.hint}>Your new card. Daub what you hear — FREE too — tap again to undo.</p>
        ) : null}
        {mine && claim ? (
          // Your failed claim, exactly as the room sees it: the wipe lands when play resumes.
          <div className="pb-pop">
            <p className={styles.wipeNote}>Card wiped — re-daub from memory when play resumes.</p>
            <Card
              numbers={claim.card}
              daubs={claim.daubs}
              green={claim.green}
              red={claim.red}
              missing={claim.missing}
              verdict
              disabled
            />
          </div>
        ) : (
          <div key={view.waitingForCall ? 'wiped' : 'card'} className="pb-enter">
            <Card
              numbers={card}
              daubs={intro ? [] : view.daubs}
              pattern={intro && view.pattern !== 'line' ? view.patternCells : []}
              freeDaubed={freeDaubed}
              onTapFree={() => setFreeDaubed((v) => !v)}
              onTap={(index) => send({ type: 'daub', index })}
              disabled={intro}
            />
          </div>
        )}
      </Screen>
    );
  }

  if (view.phaseId === 'bingo') {
    const iWon = view.winnerId === me.id;
    const claim = view.claim;
    return (
      <Screen
        key="bingo"
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
      <Screen key="scoreboard" title="Rounds won">
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
      key="done"
      title={myRank === 1 ? 'You won!' : myRank ? `You finished #${myRank}` : 'Thanks for playing'}
    >
      <Scoreboard rows={rows(view)} compact highlightId={me.id} />
    </Screen>
  );
}
