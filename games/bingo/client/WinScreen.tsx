// The winner's own phone after a bingo: the card that won, what happens next, and the choice
// (keep going or move on) once the TV's verdict has landed.
import type { JSX } from 'react';
import { Scoreboard, Screen } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { PATTERN_LABEL, patternCells } from '../server/patterns';
import { Card } from './Card';
import { PatternDemo } from './PatternDemo';
import { DecideFooter, rows } from './ControllerParts';
import type { Send } from './ControllerParts';
import { winTitle } from './copy';
import { nearest } from './close';
import styles from './Controller.module.css';

/** What happens after this bingo: the room decides, fresh cards, or the final board. */
export function afterLine(view: BingoControllerView, iDecide: boolean): string {
  if (iDecide) return 'Keep these cards and carry on calling, or deal fresh ones? Anyone can pick.';
  if (view.decide && (view.decide.same || view.decide.blackout))
    return 'The players decide: keep going or next round.';
  return view.round < view.totalRounds ? 'Fresh cards next round.' : 'That was the last round.';
}

export function WinScreen({
  view,
  send,
  cards,
  iDecide,
}: {
  view: BingoControllerView;
  send: Send;
  /** Cards per player: "— card 2" on the title when there are several. */
  cards: number;
  iDecide: boolean;
}): JSX.Element {
  const claim = view.claim;
  const which = cards > 1 && claim ? ` — card ${claim.cardIndex + 1}` : '';
  return (
    <Screen
      key="bingo"
      title={winTitle(view, which)}
      footer={<DecideFooter view={view} send={send} />}
    >
      {claim ? (
        <div className={styles.winCard}>
          <Card numbers={claim.card} daubs={claim.daubs} green={claim.green} disabled />
        </div>
      ) : null}
      <p className={styles.hint}>
        +{view.claimPoints} {view.claimPoints === 1 ? 'point' : 'points'}.{' '}
        {view.autoEnd
          ? 'Nothing left to play for on these cards — the scores in a moment.'
          : iDecide && cards > 1
            ? 'Keep going and this card sits the pattern out; your other cards play on. Anyone can pick.'
            : afterLine(view, iDecide)}
      </p>
    </Screen>
  );
}

/** Between rounds ("Points so far") and after the last one (your place). */
/** I-121: a private recap of the round from the phone's own daubs. */
function RoundRecap({ view }: { view: BingoControllerView }): JSX.Element | null {
  const cards = view.cards ?? [];
  const daubs = view.daubs[0] ?? [];
  const numbers = cards[0];
  if (!numbers) return null;
  const won = view.won.includes(0);
  const near = nearest(view.pattern, daubs);
  return (
    <div className={styles.recap}>
      <p className={styles.recapTitle}>Your round</p>
      <p className={styles.recapLine}>
        {daubs.length} {daubs.length === 1 ? 'daub' : 'daubs'}
        {won ? ' · a bingo' : near.left < 99 ? ` · closest line: ${near.where}, ${near.left} to go` : ''}
      </p>
      <div className={styles.recapCard}>
        <Card numbers={numbers} daubs={daubs} pattern={won ? [] : near.cells} freeDaubed disabled size="compact" />
      </div>
    </div>
  );
}

export function EndScreens({
  view,
  meId,
}: {
  view: BingoControllerView;
  meId: string;
}): JSX.Element {
  if (view.phaseId === 'final') {
    return (
      <Screen key="final" title="Final points">
        <Scoreboard rows={rows(view)} compact highlightId={meId} noTrophy />
        <p className={styles.hint}>And the winner is… look at the TV.</p>
      </Screen>
    );
  }
  if (view.phaseId === 'scoreboard') {
    const next = view.patterns[view.round] ?? null; // the shape and the name, as the TV (loop 288)
    return (
      <Screen key="scoreboard" title="Points so far">
        <Scoreboard rows={rows(view)} compact highlightId={meId} noTrophy />
        {next ? (
          <p className={`${styles.hint} ${styles.nextUp}`}>
            <PatternDemo pattern={next} cells={patternCells(next)} size={36} />
            Next: round {view.round + 1} — {PATTERN_LABEL[next]}
          </p>
        ) : null}
        {/* I-121 A: what only this phone knows — its own round. */}
        <RoundRecap view={view} />
      </Screen>
    );
  }
  const myRank = view.standings.find((s) => s.playerId === meId)?.rank ?? null;
  return (
    <Screen
      key="done"
      title={myRank === 1 ? 'You won!' : myRank ? `You finished #${myRank}` : 'Thanks for playing'}
    >
      <Scoreboard rows={rows(view)} compact highlightId={meId} />
    </Screen>
  );
}
