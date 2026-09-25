// Lines both surfaces say at the flip (the TV and the phone stage).
import type { Translator } from '@partybox/game-sdk/ui';
import type { RevealView } from '../server/views';

/** Everyone knew / nobody saw it coming (the same rule the reader follows, server/reveal.ts). */
export function verdictOf(r: RevealView): 'everyone' | 'nobody' | null {
  const tapped = Object.keys(r.guesses).filter((g) => !r.authors.includes(g));
  const right = tapped.filter((g) => r.authors.includes(r.guesses[g] as string)).length;
  if (tapped.length >= 2 && right === tapped.length) return 'everyone';
  if (tapped.length >= 2 && right === 0) return 'nobody';
  return null;
}

export function namesLine(L: Translator, names: string[]): string {
  if (names.length <= 1) return L('It was… {name}!', { name: names[0] ?? '?' });
  return L('It was… BOTH {names} and {last}!', {
    names: names.slice(0, -1).join(', '),
    last: names.at(-1) as string,
  });
}
