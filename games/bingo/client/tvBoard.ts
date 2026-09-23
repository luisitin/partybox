// Small helpers for the TV: where each row stood before this round's points (I-103's climb), and
// the stage's longer lines, each through the screen's translator `L` (the owner, 2026-09-22).
import { useEffect } from 'react';
import type { SoundApi, Translator } from '@partybox/game-sdk/ui';
import type { BingoTvView, ClaimView } from '../server/views';
import styles from './Tv.module.css';

/**
 * Dibs (loop 252): the "says BINGO?…" line pops with a soft rising "hm?" each time the window
 * opens — a window passing on to the next in line is a new window, so it sounds again.
 */
export function useDibsCue(armWindow: number | null, sound: SoundApi): void {
  useEffect(() => {
    if (armWindow !== null) sound.play('dibs');
  }, [armWindow, sound]);
}

/** I-103 A: where every row stood before this round's points — pre-delta wins, ties in roster
 *  order (the I-027 rule Wisecrack uses). */
export function climbFrom(view: BingoTvView): string[] {
  const roster = new Map(view.players.map((p, i) => [p.id, i]));
  return [...view.standings]
    .sort(
      (a, b) =>
        b.wins - b.delta - (a.wins - a.delta) ||
        (roster.get(a.playerId) ?? 0) - (roster.get(b.playerId) ?? 0),
    )
    .map((r) => r.playerId);
}

/** The play kicker's count: " · 2 bingos so far" (nothing before the first). */
export function bingosSoFar(n: number, L: Translator): string {
  if (n <= 0) return '';
  return ` · ${n === 1 ? L('1 bingo so far') : L('{n} bingos so far', { n })}`;
}

/** R2-01 B: "Sam is one away" / "Sam, Ana and Priya are one away" (roster order). */
export function closeLine(names: string[], L: Translator): string {
  if (names.length === 1) return L('{name} is one away', { name: names[0] ?? '' });
  return L('{names} and {last} are one away', {
    names: names.slice(0, -1).join(', '),
    last: names[names.length - 1] ?? '',
  });
}

/** I-117: the fast path's headline — a claim with nothing right on it. */
export function hopelessLine(claim: ClaimView, spicy: boolean, L: Translator): string {
  const vars = { name: claim.name, n: claim.red.length };
  if (spicy) return L("{name}. {n} of those were never called. We're watching you.", vars);
  return claim.red.length === 1
    ? L('Not yet, {name} — {n} of those was never called', vars)
    : L('Not yet, {name} — {n} of those were never called', vars);
}

/** I-108 A: a valid claim with daubs that were never called — say so. */
export function strayLine(red: number, name: string, spicy: boolean, L: Translator): string {
  if (spicy)
    return red === 1
      ? L("one fib and a bingo, {name} — we're watching you.", { name })
      : L("{n} fibs and a bingo, {name} — we're watching you.", { n: red, name });
  return red === 1
    ? L('…and 1 daub that was never called — lucky the line was real.')
    : L('…and {n} daubs that were never called — lucky the line was real.', { n: red });
}

/** The verdict's decide line after "Anyone": the choice, and what the winning card does. */
export function decideText(view: BingoTvView, L: Translator): string {
  const last = view.round >= view.totalRounds;
  const choice = view.decide?.blackout
    ? last
      ? L(
          'votes on their phone: keep going (same pattern or blackout) or finish. The caller waits.',
        )
      : L(
          'votes on their phone: keep going (same pattern or blackout) or next round. The caller waits.',
        )
    : last
      ? L('votes on their phone: keep going or finish. The caller waits.')
      : L('votes on their phone: keep going or next round. The caller waits.');
  const sitsOut =
    view.decide?.same && (view.claim?.cardCount ?? 1) > 1
      ? ` ${L('The winning card sits the pattern out; the rest play on.')}`
      : '';
  return `${choice}${sitsOut}`;
}

/**
 * The verdict's decide line. I-131 (Session B's note): with the strip gone on the verdict the card
 * grows, and the long form — the blackout option, or a winning card sitting the pattern out — ran
 * past the stage's bottom at 15-16 players, so it steps down a size.
 */
export function decideLineClass(view: BingoTvView): string {
  const long = Boolean(view.decide?.blackout) || (view.claim?.cardCount ?? 1) > 1;
  return `${styles.decideLine} ${long ? styles.decideLong : ''} pb-enter`;
}
