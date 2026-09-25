// Building the pick grid at the start of `pick` (SPEC §3.8), Suggest's draw, and the reveal order.
// Leak rules (§3.5): option ids are drawn from the rng and mean nothing; every option goes through
// the same display form; one seeded shuffle for the TV and every phone.
import { nextInt, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { fillersFor } from './content';
import { groupAnswers } from '@partybox/game-sdk/match';
import { displayForm, isTruth, matchesAny } from './lies';
import { MIN_OPTIONS } from './types';
import type { FactItem, OptionEntry, State } from './types';

/** Players' lies merged with `sameAnswer` by union-find in seat order; the display form comes
 *  from the first author's text, and authors stay in seat order. */
export function mergeLies(
  seats: readonly string[],
  lies: Readonly<Record<string, string>>,
): { text: string; authors: string[] }[] {
  const order = seats.filter((p) => Object.hasOwn(lies, p));
  const texts = order.map((p) => lies[p] ?? '');
  return groupAnswers(texts, 'en').map((group) => ({
    text: texts[group[0] ?? 0] ?? '',
    authors: group.map((i) => order[i] as string),
  }));
}

/** Up to `count` free fakes: the fact's house lies first (in a seeded order), then its fillers.
 *  Free = not the same answer as anything in `avoid` (claimed fakes, players' lies, fakes this
 *  player was offered before) or as a fake already drawn, and never the truth. Drawn lazily: the
 *  matcher is the expensive part, so it runs only until enough are found. */
function drawFakes(
  rng: RngState,
  item: FactItem,
  avoid: readonly string[],
  count: number,
): [string[], RngState] {
  const out: string[] = [];
  let r = rng;
  for (const group of [item.houseLies, fillersFor(item)]) {
    if (out.length >= count) break;
    const [order, next] = shuffle(r, group);
    r = next;
    for (const fake of order) {
      if (out.length >= count) break;
      if (matchesAny(fake, avoid) || matchesAny(fake, out) || isTruth(fake, item)) continue;
      out.push(fake);
    }
  }
  return [out, r];
}

/** Draws distinct opaque ids ("o3", "o41") that are never a player id. */
function drawIds(rng: RngState, count: number, avoid: readonly string[]): [string[], RngState] {
  const ids: string[] = [];
  let r = rng;
  while (ids.length < count) {
    const [n, next] = nextInt(r, 1, 99);
    r = next;
    const id = `o${n}`;
    if (!ids.includes(id) && !avoid.includes(id)) ids.push(id);
  }
  return [ids, r];
}

/** The options for the question on stage: merged lies, the truth, house padding up to five. */
export function buildOptions(state: State): [OptionEntry[], RngState] {
  const { q } = state;
  const merged = mergeLies(state.seats, q.lies);
  const entries: Omit<OptionEntry, 'id'>[] = merged.map((m) => ({
    display: displayForm(m.text),
    authors: m.authors,
    house: false,
    truth: false,
  }));
  entries.push({
    display: displayForm(q.item.truth.answer),
    authors: [],
    house: false,
    truth: true,
  });
  let rng = state.rng;
  const need = MIN_OPTIONS - entries.length;
  if (need > 0) {
    const [fakes, r] = drawFakes(rng, q.item, [...q.claimed, ...Object.values(q.lies)], need);
    rng = r;
    for (const fake of fakes)
      entries.push({ display: displayForm(fake), authors: [], house: true, truth: false });
  }
  const [ids, r1] = drawIds(rng, entries.length, Object.keys(state.players));
  const [ordered, r2] = shuffle(
    r1,
    entries.map((e, i) => ({ ...e, id: ids[i] as string })),
  );
  return [ordered, r2];
}

/** Suggest (SPEC §3.8): two unclaimed fakes for this player, never one offered to them before in
 *  this game. Returns the two and the advanced rng. */
export function drawSuggestions(state: State, playerId: string): [string[], RngState] {
  const seen = state.offered[playerId] ?? [];
  return drawFakes(state.rng, state.q.item, [...state.q.claimed, ...seen], 2);
}

/** Player ids who picked option `id`, in seat order. */
export function pickersOf(state: State, id: string): string[] {
  return state.seats.filter((p) => state.q.picks[p] === id);
}

/** Picked lies by fewest pickers (ties: option order), then the truth — always last. */
export function revealOrderOf(state: State): string[] {
  const options = state.q.options ?? [];
  const lies = options
    .map((o, index) => ({ o, index, count: pickersOf(state, o.id).length }))
    .filter((x) => !x.o.truth && x.count > 0)
    .sort((a, b) => a.count - b.count || a.index - b.index)
    .map((x) => x.o.id);
  const truth = options.find((o) => o.truth);
  return truth ? [...lies, truth.id] : lies;
}

/** Player lies nobody picked (house lies are never listed): the "Nobody fell for…" strip. */
export function unpickedLies(state: State): OptionEntry[] {
  return (state.q.options ?? []).filter(
    (o) => o.authors.length > 0 && pickersOf(state, o.id).length === 0,
  );
}

/** The option a player wrote (or co-wrote), if any. */
export function ownOption(state: State, playerId: string): OptionEntry | null {
  return (state.q.options ?? []).find((o) => o.authors.includes(playerId)) ?? null;
}
