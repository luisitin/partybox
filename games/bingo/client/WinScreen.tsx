// The winner's own phone after a bingo: the card that won, what happens next, and the choice
// (keep going or move on) once the TV's verdict has landed.
import type { JSX } from 'react';
import { Scoreboard, Screen, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { PATTERN_LABEL, patternCells } from '../server/patterns';
import { Card } from './Card';
import { PatternDemo } from './PatternDemo';
import { DecideFooter, rows } from './ControllerParts';
import type { Send } from './ControllerParts';
import { winTitle } from './copy';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

/** What happens after this bingo: the room decides, fresh cards, or the final board. */
export function afterLine(view: BingoControllerView, iDecide: boolean, L: Translator): string {
  if (iDecide)
    return L('Keep these cards and carry on calling, or deal fresh ones? Anyone can pick.');
  if (view.decide && (view.decide.same || view.decide.blackout))
    return L('The players decide: keep going or next round.');
  return view.round < view.totalRounds
    ? L('Fresh cards next round.')
    : L('That was the last round.');
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
  const L = useT(STRINGS);
  const which = cards > 1 && claim ? claim.cardIndex + 1 : null;
  return (
    <Screen
      key="bingo"
      title={winTitle(view, which, L)}
      footer={<DecideFooter view={view} send={send} />}
    >
      {claim ? (
        <div className={styles.winCard}>
          <Card numbers={claim.card} daubs={claim.daubs} green={claim.green} disabled />
        </div>
      ) : null}
      <p className={styles.hint}>
        {view.claimPoints === 1 ? L('+1 point.') : L('+{n} points.', { n: view.claimPoints })}{' '}
        {view.autoEnd
          ? L('Nothing left to play for on these cards — the scores in a moment.')
          : iDecide && cards > 1
            ? L(
                'Keep going and this card sits the pattern out; your other cards play on. Anyone can pick.',
              )
            : afterLine(view, iDecide, L)}
      </p>
    </Screen>
  );
}

/** Between rounds ("Points so far") and after the last one (your place). */
export function EndScreens({
  view,
  meId,
}: {
  view: BingoControllerView;
  meId: string;
}): JSX.Element {
  const L = useT(STRINGS);
  if (view.phaseId === 'final') {
    return (
      <Screen key="final" title={L('Final points')}>
        <Scoreboard rows={rows(view)} compact highlightId={meId} noTrophy />
        <p className={styles.hint}>{finalLine(view, L)}</p>
      </Screen>
    );
  }
  if (view.phaseId === 'scoreboard') {
    const next = view.patterns[view.round] ?? null; // the shape and the name, as the TV (loop 288)
    return (
      <Screen key="scoreboard" title={L('Points so far')}>
        <Scoreboard rows={rows(view)} compact highlightId={meId} noTrophy />
        {next ? (
          <p className={`${styles.hint} ${styles.nextUp}`}>
            <PatternDemo pattern={next} cells={patternCells(next)} size={36} />
            {L('Next: round {round} — {pattern}', {
              round: view.round + 1,
              pattern: L.sent(PATTERN_LABEL[next]),
            })}
          </p>
        ) : null}
      </Screen>
    );
  }
  const myRank = view.standings.find((s) => s.playerId === meId)?.rank ?? null;
  return (
    <Screen
      key="done"
      title={
        myRank === 1
          ? L('You won!')
          : myRank
            ? L('You finished #{rank}', { rank: myRank })
            : L('Thanks for playing')
      }
    >
      <Scoreboard rows={rows(view)} compact highlightId={meId} />
    </Screen>
  );
}

/** The final board's line: the TV names the winner, so a phone points there — unless there is no
 *  TV (phone only), where the phone names them itself. */
function finalLine(view: BingoControllerView, L: Translator): string {
  if (!view.phoneOnly) return L('And the winner is… look at the TV.');
  const top = view.standings.filter((s) => s.rank === 1);
  if (top.length === 1 && top[0]) return L('And the winner is… {name}!', { name: top[0].name });
  return top.length > 1 ? L('A tie at the top!') : L('That’s the game!');
}
