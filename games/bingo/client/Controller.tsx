// Controller (phone) view for Bingo: the current call's NICKNAME on top (the number itself is on
// the TV — the phone never spoils the stage, and the room has to listen to the caller), your
// tappable card (or cards, stacked and labelled) in the middle, the BINGO! button pinned to the
// bottom. `send` is the only way out; the server accepts every daub (no validation — that is the
// game) and judges only the claim — checking whichever live card is closest, so one button serves
// all. After a bingo any phone decides: keep going on the same cards (the card that won sits the
// pattern out) or move on.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Scoreboard, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { Card, PatternIcon } from './Card';
import { CallHeader, CardStack, DecideFooter, rows } from './ControllerParts';
import styles from './Controller.module.css';

/** What happens after this bingo: the room decides, fresh cards, or the final board. */
function afterLine(view: BingoControllerView, iDecide: boolean): string {
  if (iDecide) return 'Keep these cards and carry on calling, or deal fresh ones? Anyone can pick.';
  if (view.decide && (view.decide.same || view.decide.blackout))
    return 'The players decide: keep going or next round.';
  return view.round < view.totalRounds ? 'Fresh cards next round.' : 'That was the last round.';
}

export function Controller({
  view,
  me,
  send,
}: GameControllerProps<BingoControllerView, Input>): JSX.Element {
  const cards = view.cards;
  // FREE always counts (server); daubing it is pure satisfaction, so it lives on the phone only
  // (per card) and resets with every fresh deal (round) — "adjust state when a prop changes".
  const [freeDaubed, setFreeDaubed] = useState<number[]>([]);
  const toggleFree = (c: number): void =>
    setFreeDaubed((v) => (v.includes(c) ? v.filter((i) => i !== c) : [...v, c]));
  // Calls that landed while this phone was away (review-loop #4): a jump of more than one in
  // callIndex between two views means we missed some. With the hall board on the TV a toast points
  // there; without it the header names the missed nicknames. "Adjust state when a prop changes".
  const [seenCall, setSeenCall] = useState(view.callIndex);
  const [missed, setMissed] = useState<{ count: number; names: string[] } | null>(null);
  if (view.callIndex !== seenCall) {
    const jumped = view.callIndex - seenCall;
    setSeenCall(view.callIndex);
    if (jumped > 1 && view.phaseId === 'play')
      setMissed({ count: jumped - 1, names: view.recent.slice(-jumped, -1) });
  }
  useEffect(() => {
    if (!missed) return;
    // The toast goes after 5 s; the header note stays a couple of calls (no board to catch up from).
    const handle = setTimeout(() => setMissed(null), view.showBoard ? 5000 : 12_000);
    return () => clearTimeout(handle);
  }, [missed, view.showBoard]);
  const [freeRound, setFreeRound] = useState(view.round);
  if (freeRound !== view.round) {
    setFreeRound(view.round);
    setFreeDaubed([]);
  }
  if (!cards) {
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
  const iDecide = view.decide !== null && (view.decide.same || view.decide.blackout);

  // The round's own screens: intro, play, check and a bingo phase without a winner's card to show
  // (no bingo, or someone else won) all keep the same cards mounted (review-loop #2, #15).
  const roundOver = view.phaseId === 'bingo' && !(view.winnerId === me.id && view.claim);
  if (
    view.phaseId === 'intro' ||
    view.phaseId === 'play' ||
    view.phaseId === 'check' ||
    roundOver
  ) {
    const intro = view.phaseId === 'intro';
    const checking = view.phaseId === 'check';
    const mine = checking && view.claim?.playerId === me.id;
    // Short: the footer is one line even on a 320 px phone (the TV carries the story).
    const label = mine
      ? 'Not a bingo'
      : checking
        ? 'Look at the TV'
        : view.doneForRound
          ? 'Yours already'
          : view.waitingForCall
            ? 'Next number soon…'
            : 'BINGO!';
    return (
      // One node for intro + play + check (review-loop #2): the card a player just got must not
      // blank and rise again when the first call lands, nor when a claim is checked (freeDaubed
      // lives in this Controller, above the Screen, so it survives either way).
      <Screen
        key="round"
        title={
          intro
            ? `Round ${view.round} of ${view.totalRounds}`
            : roundOver
              ? view.winnerName
                ? `${view.winnerName} has bingo`
                : 'No bingo this round'
              : undefined
        }
        footer={
          roundOver ? (
            <DecideFooter view={view} send={send} />
          ) : intro ? undefined : (
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
        <div className={styles.roundBody}>
          {roundOver ? (
            <p className={styles.hint}>{afterLine(view, iDecide)}</p>
          ) : intro ? (
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
            <CallHeader
              current={view.current}
              previous={view.previous}
              index={view.callIndex}
              pattern={view.patternLabel}
              missed={missed && !view.showBoard ? missed.names : null}
            />
          )}
          {missed && view.showBoard ? (
            <p className={styles.missedToast} role="status">
              {missed.count === 1
                ? 'Back — you missed a number. It is on the TV board.'
                : `Back — you missed ${missed.count} numbers. They are on the TV board.`}
            </p>
          ) : null}
          {intro ? (
            <p className={styles.hint}>
              {cards.length > 1
                ? `Your ${cards.length} new cards. Daub what you hear — FREE too — tap again to undo. BINGO! checks your best card.`
                : 'Your new card. Daub what you hear — FREE too — tap again to undo.'}
            </p>
          ) : null}
          <CardStack
            view={view}
            cards={cards}
            freeDaubed={freeDaubed}
            onTapFree={toggleFree}
            onTap={(card, index) => send({ type: 'daub', card, index })}
            intro={intro}
            disabled={intro || roundOver}
            showClaim={mine}
          />
        </div>
      </Screen>
    );
  }

  if (view.phaseId === 'bingo') {
    const claim = view.claim;
    const which = cards.length > 1 && claim ? ` — card ${claim.cardIndex + 1}` : '';
    return (
      <Screen
        key="bingo"
        title={`BINGO! You win round ${view.round}${which}`}
        footer={<DecideFooter view={view} send={send} />}
      >
        {claim ? (
          <Card numbers={claim.card} daubs={claim.daubs} green={claim.green} disabled />
        ) : null}
        <p className={styles.hint}>
          {iDecide && cards.length > 1
            ? 'Keep going and that card sits the pattern out; your other cards play on. '
            : ''}
          {afterLine(view, iDecide)}
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
