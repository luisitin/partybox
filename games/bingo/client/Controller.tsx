// Controller (phone) view for Bingo: the current call's NICKNAME on top (the number itself is on
// the TV — the phone never spoils the stage, and the room has to listen to the caller), your
// tappable card (or cards, stacked and labelled) in the middle, the BINGO! button pinned to the
// bottom. `send` is the only way out; the server accepts every daub (no validation — that is the
// game) and judges only the claim — checking whichever card is closest, so one button serves all.
import { useEffect, useState } from 'react';
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
  pattern,
  missed,
}: {
  current: CallView | null;
  previous: CallView | null;
  index: number;
  pattern: string;
  /** Nicknames this phone never saw (no hall board on the TV to catch up from). */
  missed: string[] | null;
}): JSX.Element {
  if (!current) return <div className={styles.header} />;
  return (
    <div className={styles.header} role="status" aria-live="polite">
      <div className={styles.now} key={current.number}>
        {/* Spicy nicknames run long ("Doctor's orders — take two and call me"): over ~20 characters
            the phrase steps down a size so a 320 px phone keeps the call line below it (loop #7). */}
        <span className={`${styles.phrase} ${current.call.length > 20 ? styles.phraseLong : ''}`}>
          {current.call}
        </span>
      </div>
      <p className={styles.meta}>
        Call {index} · {pattern} ·{' '}
        {missed && missed.length > 0
          ? `missed: ${missed.join(', ')}`
          : previous
            ? // Nicknames are "Number — pun" (review-loop #40): the meta line keeps the short half.
              `before: ${previous.call.split(' — ')[0]}`
            : 'the number is on the TV'}
      </p>
    </div>
  );
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

  // The round's own screens: intro, play, check and a bingo phase without a winner's card to show
  // (no bingo, or someone else won) all keep the same card mounted (review-loop #2, #15).
  const roundOver = view.phaseId === 'bingo' && !(view.winnerId === me.id && view.claim);
  if (
    view.phaseId === 'intro' ||
    view.phaseId === 'play' ||
    view.phaseId === 'check' ||
    roundOver
  ) {
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
          intro || roundOver ? undefined : (
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
            <p className={styles.hint}>
              {view.round < view.totalRounds
                ? 'Fresh cards next round.'
                : 'That was the last round.'}
            </p>
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
          <div className={styles.cards}>
            {cards.map((card, c) =>
              mine && claim && claim.cardIndex === c ? (
                // Your failed claim, exactly as the room sees it: the wipe lands when play resumes.
                <div key={`claim-${c}`} className="pb-pop">
                  <p className={styles.wipeNote}>
                    {cards.length > 1 ? `Card ${c + 1} wiped` : 'Card wiped'} — re-daub from memory
                    when play resumes.
                  </p>
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
                <div key={`${c}-${view.waitingForCall ? 'wiped' : 'card'}`} className="pb-enter">
                  {cards.length > 1 ? <p className={styles.cardLabel}>Card {c + 1}</p> : null}
                  <Card
                    numbers={card}
                    daubs={intro ? [] : (view.daubs[c] ?? [])}
                    pattern={intro && view.pattern !== 'line' ? view.patternCells : []}
                    freeDaubed={freeDaubed.includes(c)}
                    onTapFree={() => toggleFree(c)}
                    onTap={(index) => send({ type: 'daub', card: c, index })}
                    disabled={intro || roundOver}
                    size={cards.length > 2 ? 'compact' : 'phone'}
                  />
                </div>
              ),
            )}
          </div>
        </div>
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
          <div className={styles.cards}>
            {cards.map((card, c) => (
              <Card
                key={c}
                numbers={card}
                daubs={view.daubs[c] ?? []}
                freeDaubed={freeDaubed.includes(c)}
                disabled
                size={cards.length > 2 ? 'compact' : 'phone'}
              />
            ))}
          </div>
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
