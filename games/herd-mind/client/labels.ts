// Words the TV and phone share: the question kicker, the verdict banner, a player's own line.
import type { Translator, ViewPlayer } from '@partybox/game-sdk/ui';
import type { MyResult } from '../server/views';
import type { Outcome } from '../server/types';

export function kicker(n: number, total: number, target: number, L: Translator): string {
  return L('Question {n} of {total} · First to {target}', { n, total, target });
}

/** The banner over the columns once every card has landed. */
export function verdictLine(outcome: Outcome | null, label: string, L: Translator): string {
  if (outcome === 'herd') return L('The herd says {answer}!', { answer: label });
  if (outcome === 'tie') return L("No herd. It's a tie!");
  if (outcome === 'scattered') return L('No herd. Everyone went their own way!');
  return L('Nobody answered.');
}

/** "Ana, Ben and Cy" — names in order, the last two joined with "and". */
export function nameList(
  ids: readonly string[],
  players: readonly ViewPlayer[],
  L: Translator,
): string {
  const names = ids.map((id) => players.find((p) => p.id === id)?.name ?? '?');
  if (names.length <= 1) return names[0] ?? '';
  return L('{list} and {last}', { list: names.slice(0, -1).join(', '), last: names.at(-1) ?? '' });
}

/** A player's own result line (SPEC §2.5 phone). */
export function resultLine(r: MyResult, L: Translator): string {
  switch (r.kind) {
    case 'herd':
      return L('🐑 In the herd! +1 ({answer}, {count} of you)', {
        answer: r.label,
        count: r.count,
      });
    case 'sheep':
      return L("Alone with {answer}. You've got the Black Sheep.", { answer: r.label });
    case 'alone':
      return L('Alone with {answer}. Nobody takes the sheep this time.', { answer: r.label });
    case 'tie':
      return L('{answer}, {count} of you. Tie. Nobody scores.', {
        answer: r.label,
        count: r.count,
      });
    case 'group':
      return L('{answer}, {count} of you. Not the herd.', { answer: r.label, count: r.count });
    default:
      return L('No answer this time.');
  }
}
