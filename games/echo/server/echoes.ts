// Echo groups (§7.6): every clue grouped with `sameAnswer` (union-find, seat order); a group of
// two or more vanishes. During `check` a clue-giver can split an echo or join two survivors.
import { PACK_LANG } from './content';
import { groupAnswers } from './match/index';
import type { ClueRef, Group, State } from './types';

/** Every written clue in seat order: the order the check list shows and the groups are built in. */
export function clueRefs(state: State): ClueRef[] {
  const out: ClueRef[] = [];
  for (const by of state.seats) {
    const texts = state.w.clues[by];
    if (texts) texts.forEach((_, i) => out.push({ by, i }));
  }
  return out;
}

export function textOf(state: State, ref: ClueRef): string {
  return state.w.clues[ref.by]?.[ref.i] ?? '';
}

export function autoGroups(state: State): Group[] {
  const refs = clueRefs(state);
  const texts = refs.map((r) => textOf(state, r));
  return groupAnswers(texts, PACK_LANG).map((idxs) => ({
    id: `g${idxs[0] as number}`,
    refs: idxs.map((i) => refs[i] as ClueRef),
    echo: idxs.length >= 2,
  }));
}

/** "Not the same ✋" on an echo, or the undo of a split / a join: the group flips. */
export function splitGroup(groups: readonly Group[], id: string): Group[] | null {
  const g = groups.find((x) => x.id === id);
  if (!g || g.refs.length < 2) return null;
  return groups.map((x) => (x.id === id ? { ...x, echo: !x.echo } : x));
}

/** "Same word ✋": two surviving groups become one echo. */
export function joinGroups(groups: readonly Group[], a: string, b: string): Group[] | null {
  if (a === b) return null;
  const ga = groups.find((x) => x.id === a);
  const gb = groups.find((x) => x.id === b);
  if (!ga || !gb || ga.echo || gb.echo) return null;
  const [first, second] = groups.indexOf(ga) < groups.indexOf(gb) ? [ga, gb] : [gb, ga];
  const merged: Group = { id: first.id, refs: [...first.refs, ...second.refs], echo: true };
  return groups.filter((x) => x !== second).map((x) => (x === first ? merged : x));
}

export function survivorRefs(state: State): ClueRef[] {
  return (state.w.groups ?? autoGroups(state)).filter((g) => !g.echo).flatMap((g) => g.refs);
}

export function echoedRefs(state: State): ClueRef[] {
  return (state.w.groups ?? autoGroups(state)).filter((g) => g.echo).flatMap((g) => g.refs);
}

export function survivorTexts(state: State): string[] {
  return survivorRefs(state).map((r) => textOf(state, r));
}
