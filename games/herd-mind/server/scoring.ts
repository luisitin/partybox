// Scoring (SPEC §2.6): the herd scores, the lone player takes the Black Sheep, and nobody holding
// it can win. Scores never go down. Pure.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import type { State, Stats } from './types';

const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** Players who can still win: not gone, not holding the sheep. */
function eligible(state: State): string[] {
  return state.seats.filter((id) => !state.left.includes(id) && id !== state.sheep);
}

/** The win check (§2.6 step 4), and the top scorers once the questions run out (step 5). */
export function winnersOf(state: State, last: boolean): string[] {
  const reached = eligible(state).filter((id) => (state.scores[id] ?? 0) >= state.cfg.target);
  if (reached.length > 0 || !last) return reached;
  const pool = eligible(state);
  const top = Math.max(0, ...pool.map((id) => state.scores[id] ?? 0));
  return pool.filter((id) => (state.scores[id] ?? 0) === top);
}

/** Applies the current question's outcome: +1 to the herd, the sheep, the stats, the pairs. */
export function scoreQuestion(state: State): State {
  const groups = state.q.groups ?? [];
  const herd = groups.find((g) => g.key === state.q.herd);
  const scored = herd ? [...herd.members] : [];
  const scores = { ...state.scores };
  const stats: Record<string, Stats> = {};
  for (const id of state.seats)
    stats[id] = { ...(state.stats[id] ?? { herd: 0, alone: 0, sheepHeld: 0 }) };
  for (const id of scored) {
    scores[id] = (scores[id] ?? 0) + 1;
    (stats[id] as Stats).herd += 1;
  }
  const pairs = { ...state.pairs };
  for (const g of groups) {
    if (g.members.length === 1) (stats[g.members[0] ?? ''] ?? { alone: 0 }).alone += 1;
    for (let i = 0; i < g.members.length; i++)
      for (let j = i + 1; j < g.members.length; j++) {
        const k = pairKey(g.members[i] ?? '', g.members[j] ?? '');
        pairs[k] = (pairs[k] ?? 0) + 1;
      }
  }
  const sheep = state.q.lone ?? state.sheep;
  if (sheep !== null && stats[sheep]) (stats[sheep] as Stats).sheepHeld += 1;
  const next: State = {
    ...state,
    scores,
    stats,
    pairs,
    sheep,
    q: { ...state.q, scored, sheepFrom: state.sheep },
  };
  const last = state.q.n + 1 >= state.questions.length;
  return { ...next, winners: winnersOf(next, last) };
}

/** Rank by points, except a sheep holder who would outrank the winners sits right below them. */
function ranking(state: State, scores: Record<string, number>): GameResults['ranking'] {
  const winners = state.winners.filter((id) => Object.hasOwn(scores, id));
  const top = Math.min(...winners.map((id) => scores[id] ?? 0));
  const rest = state.seats
    .filter((id) => !winners.includes(id))
    .sort(
      (a, b) =>
        (scores[b] ?? 0) - (scores[a] ?? 0) || state.seats.indexOf(a) - state.seats.indexOf(b),
    );
  const holder = state.sheep;
  const demoted =
    holder !== null && winners.length > 0 && rest.includes(holder) && (scores[holder] ?? 0) >= top;
  const order = demoted && holder ? [holder, ...rest.filter((id) => id !== holder)] : rest;
  const rows = winners.map((playerId) => ({ playerId, score: scores[playerId] ?? 0, rank: 1 }));
  let prevScore: number | null = null;
  let prevRank = 0;
  order.forEach((playerId, i) => {
    const score = scores[playerId] ?? 0;
    const pinned = demoted && i === 0;
    const rank = !pinned && score === prevScore ? prevRank : winners.length + i + 1;
    rows.push({ playerId, score, rank });
    prevScore = pinned ? null : score;
    prevRank = rank;
  });
  return rows;
}

/** Everyone tied on the highest count of `pick` shares the award; nobody earns it at zero. */
function mostOf(state: State, pick: (s: Stats) => number): string[] {
  const best = Math.max(
    0,
    ...state.seats.map((id) => pick(state.stats[id] ?? { herd: 0, alone: 0, sheepHeld: 0 })),
  );
  if (best === 0) return [];
  return state.seats.filter(
    (id) => pick(state.stats[id] ?? { herd: 0, alone: 0, sheepHeld: 0 }) === best,
  );
}

export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  const give = (id: string, title: string, description: string, who: string[]): void => {
    for (const playerId of who) out.push({ id, title, description, playerId });
  };
  give(
    'head-of-herd',
    '🐑 Head of the Herd',
    'In the herd most often',
    mostOf(state, (s) => s.herd),
  );
  give(
    'free-spirit',
    '🦄 Free Spirit',
    'Alone with an answer most often',
    mostOf(state, (s) => s.alone),
  );
  give(
    'black-sheep',
    '🖤 The Black Sheep',
    'Held the sheep for the most questions',
    mostOf(state, (s) => s.sheepHeld),
  );
  const bestPair = Math.max(0, ...Object.values(state.pairs));
  if (bestPair > 1) {
    const melded = new Set<string>();
    for (const [key, n] of Object.entries(state.pairs))
      if (n === bestPair) for (const id of key.split('|')) melded.add(id);
    give(
      'mind-meld',
      '🤝 Mind Meld',
      'The pair who thought alike most often',
      state.seats.filter((id) => melded.has(id)),
    );
  }
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  // enterDone always settles `winners` (an early end too), so the sheep holder never wins here.
  const base = buildResults(state, state.scores, awards(state));
  return { ...base, ranking: ranking(state, base.scores), winnerIds: [...state.winners] };
}
