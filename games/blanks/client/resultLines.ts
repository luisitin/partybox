// The result's sentences, shared by the TV's stage and the phone's result screen: the headline
// naming who won, a list of names, and the votes pill. Each takes the screen's translator `L`, so
// the line reads in the device's language (the names stay as typed). Split from TvResult.tsx.
import type { Translator } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';

export function winnerLine(
  view: Pick<BlanksTvView, 'revealed' | 'winnerIds' | 'walkover' | 'judgeMode' | 'czar'>,
  L: Translator,
): string {
  const winners = view.revealed.filter((r) => r.winner);
  if (winners.length === 0) {
    if (view.revealed.length === 0) return L('Nobody played a card');
    if (view.judgeMode === 'czar') {
      const judge = view.czar;
      if (judge?.connected === false)
        return L('{name} dropped — no judge, nobody wins this round', { name: judge.name });
      return judge
        ? L('{name} never picked — nobody wins this round', { name: judge.name })
        : L('The judge never picked — nobody wins this round');
    }
    return L('No votes — nobody wins this round');
  }
  const humans = winners.filter((w) => !w.rando).map((w) => w.name);
  // Rando alone is the room's shame; a tie with Rando still names who scored (review-loop #124).
  if (humans.length === 0) return L('Rando wins this one! Shame on all of you.');
  if (humans.length < winners.length)
    return L('{names} split it with Rando', { names: list(humans, L) });
  const names = humans;
  if (view.walkover) return L('Only {name} played — wins by default', { name: names[0] ?? '' });
  // Two cards, no one else to vote: the round skipped the vote and both take the point.
  if (names.length === 2 && view.revealed.every((r) => r.votes === 0))
    return L('Only two cards — {a} and {b} split it', { a: names[0] ?? '', b: names[1] ?? '' });
  if (names.length === 1) return L('{name} wins the round!', { name: names[0] ?? '' });
  return L('{names} split it', { names: list(names, L) });
}

/** "Ana", "Ana and Ben", "Ana, Ben and Cleo". */
export function list(names: string[], L: Translator): string {
  if (names.length <= 1) return names[0] ?? '';
  return L('{rest} and {last}', {
    rest: names.slice(0, -1).join(', '),
    last: names[names.length - 1] ?? '',
  });
}

/** The pill on a card with votes: "3 votes" — or, with a judge, whose pick it was ("1 vote" from a
 *  lone judge read as a poor turnout, review-loop #116). Null when nobody voted for it. */
export function votesLabel(
  view: Pick<BlanksTvView, 'judgeMode' | 'czar'>,
  votes: number,
  L: Translator,
): string | null {
  if (votes === 0) return null;
  if (view.judgeMode === 'czar')
    return view.czar ? L("{name}'s pick", { name: view.czar.name }) : L("Judge's pick");
  return votes === 1 ? L('1 vote') : L('{n} votes', { n: votes });
}
