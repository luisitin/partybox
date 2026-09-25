// Bots (SPEC §9.15): honest by construction — every decision starts from the bot's own phone view
// (Part 00 rule 7.9). The pack's themes are their general knowledge: a bot spymaster clues the best
// theme that avoids the assassin; a bot guesser follows theme clues and hints, and on a team with a
// person guessing it only ever copies what the people point at.
import type { Rng } from '@partybox/game-sdk';
import type { Theme } from '../content/schema';
import { clueProblem } from './clue-rules';
import { LANG, SPICY_WORDS, poolFor, wordEntry } from './content';
import { sameAnswer } from '@partybox/game-sdk/match';
import { controllerView } from './views';
import type { SpyControllerView } from './views';
import type { Input, Pointer, State } from './types';

const SPICY_IDS = new Set(SPICY_WORDS.map((w) => w.id));

function themesFor(v: SpyControllerView): readonly Theme[] {
  return poolFor(v.words.some((w) => SPICY_IDS.has(w.toLowerCase()))).themes;
}

const faceDown = (v: SpyControllerView): number[] =>
  v.words.map((_, i) => i).filter((i) => v.kinds[i] === null);

function targets(v: SpyControllerView): { answer: string; family: string[] }[] {
  return faceDown(v).map((i) => {
    const id = (v.words[i] ?? '').toLowerCase();
    return { answer: id, family: wordEntry(id).family };
  });
}

export function spymasterClue(v: SpyControllerView, rng: Rng): Input | null {
  const key = v.key;
  if (!key || !v.team) return null;
  const down = new Map(faceDown(v).map((i) => [(v.words[i] ?? '').toLowerCase(), key[i]]));
  const legal = targets(v);
  const scored: { theme: Theme; own: number; score: number }[] = [];
  for (const theme of themesFor(v)) {
    let own = 0;
    let enemy = 0;
    let bystander = 0;
    let assassin = false;
    for (const m of theme.members) {
      const kind = down.get(m);
      if (kind === 'assassin') assassin = true;
      else if (kind === v.team) own++;
      else if (kind === 'bystander') bystander++;
      else if (kind) enemy++;
    }
    if (assassin || own === 0) continue;
    const score = own - 1.5 * enemy - 0.5 * bystander;
    if (score >= 1) scored.push({ theme, own, score });
  }
  scored.sort((a, b) => b.score - a.score);
  const top =
    scored.length > 1 &&
    (scored[0]?.score ?? 0) - (scored[1]?.score ?? 0) < 0.5 &&
    rng.float() < 0.5
      ? [scored[1], scored[0]]
      : scored;
  for (const pick of top) {
    if (!pick) continue;
    const word = [pick.theme.clue, ...pick.theme.alts].find((w) => clueProblem(w, legal) === null);
    if (word) return { type: 'clue', word, number: Math.min(pick.own, 4) };
  }
  // Fallback: one own agent, clued by one of its hints.
  const own = faceDown(v).filter((i) => key[i] === v.team);
  const start = own.length > 0 ? rng.int(0, own.length - 1) : 0;
  for (let k = 0; k < own.length; k++) {
    const id = (v.words[own[(start + k) % own.length] ?? 0] ?? '').toLowerCase();
    const hint = wordEntry(id).hints.find((h) => clueProblem(h, legal) === null);
    if (hint) return { type: 'clue', word: hint, number: 1 };
  }
  return null;
}

/** What an all-bot team points at for the clue in play (§9.15 steps 1–4). */
function plan(v: SpyControllerView, rng: Rng): Pointer | null {
  const clue = v.clue;
  if (!clue) return null;
  const flipsSoFar = clue.number + 1 - v.guessesLeft;
  if (flipsSoFar >= clue.number) return v.canEnd ? 'end' : null;
  const down = faceDown(v);
  const idOf = (i: number): string => (v.words[i] ?? '').toLowerCase();
  // Score every face-down word by how the clue relates to it: a theme the clue names (3), one of
  // the word's own hints (3), a theme that shares a hint-matched word (1). A clue from outside the
  // packs (a person's) still lands on the closest words instead of stalling the turn.
  const said = (w: string): boolean => sameAnswer(w, clue.word, LANG);
  const themes = themesFor(v);
  const named = themes.filter((t) => [t.clue, ...t.alts].some(said));
  const hinted = new Set(down.filter((i) => wordEntry(idOf(i)).hints.some(said)));
  const near = themes.filter((t) =>
    t.members.some((m) => down.some((i) => hinted.has(i) && idOf(i) === m)),
  );
  let best: number | null = null;
  let top = 0;
  for (const i of down) {
    const id = idOf(i);
    const score =
      (named.some((t) => t.members.includes(id)) ? 3 : 0) +
      (hinted.has(i) ? 3 : 0) +
      (near.some((t) => t.members.includes(id)) ? 1 : 0);
    if (score > top) [best, top] = [i, score];
  }
  if (best !== null) return best;
  // Nothing relates: a first guess is owed (End turn opens only after a flip), so take a chance.
  if ((!v.canEnd || rng.float() < 0.3) && down.length > 0)
    return down[rng.int(0, down.length - 1)] ?? null;
  return v.canEnd ? 'end' : null;
}

/** The target most people on the bot's team point at, or null. */
function peopleLead(v: SpyControllerView): { people: boolean; lead: Pointer | null } {
  const team = v.team;
  if (!team) return { people: false, lead: null };
  const connected = new Set(v.players.filter((p) => p.connected).map((p) => p.id));
  const people = v.teams[team].filter(
    (id) => id !== v.spymaster[team] && !v.bots.includes(id) && connected.has(id),
  );
  const counts = new Map<Pointer, number>();
  for (const id of people) {
    const p = v.pointers[id];
    if (p !== undefined) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  let lead: Pointer | null = null;
  let top = 0;
  for (const [target, n] of counts) if (n > top) [lead, top] = [target, n];
  return { people: people.length > 0, lead };
}

export function guesserPoint(v: SpyControllerView, rng: Rng): Input | null {
  // A seat that is not a bot (the sim and e2e play people with this too) leads; a bot on a team
  // with people guessing only follows them (§9.7).
  const { people, lead } = peopleLead(v);
  const follow = v.bots.includes(v.me.id) && people;
  const target = follow ? lead : plan(v, rng);
  if (target === null || target === v.myPointer) return null;
  return { type: 'point', target };
}

export function sampleInput(state: State, playerId: string, rng: Rng): Input | null {
  const v = controllerView(state, 'spy-grid', playerId);
  if (v.me.role !== 'player') return null;
  if (v.phaseId === 'clue' && v.role === 'spymaster' && v.team === v.turnTeam)
    return spymasterClue(v, rng);
  if (v.phaseId === 'guess' && v.role === 'guesser') return guesserPoint(v, rng);
  return null;
}
