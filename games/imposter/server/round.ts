// Round bookkeeping shared by the phases (never a phase itself): settings after presence (SPEC
// §1.12–1.13), who is seated, the imposter bag, and read helpers over the round.
import { multiselectPicks, shuffle } from '@partybox/game-sdk';
import type { InitContext, Settings } from '@partybox/game-sdk';
import type { Cfg, Clue, Presence, Round, State } from './types';

const num = (s: Settings, key: string, dflt: number, min: number, max: number): number => {
  const v = Number(s[key] ?? dflt);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : dflt;
};
const pickOf = <T extends string>(s: Settings, key: string, allowed: readonly T[], dflt: T): T => {
  const v = String(s[key] ?? dflt);
  return (allowed as readonly string[]).includes(v) ? (v as T) : dflt;
};

/** The presence snapshot at start (ADR-047 / F4); a room without it plays "together". */
export function presenceOf(ctx: InitContext): Presence {
  const p = (ctx as InitContext & { presence?: Partial<Presence> }).presence;
  const mode = p?.mode === 'remote-voice' || p?.mode === 'remote-text' ? p.mode : 'together';
  return { mode, phoneOnly: p?.phoneOnly === true };
}

/** SPEC §1.12 + §1.13: talk is forced off with no shared channel; auto clue rounds follow talk. */
export function resolveCfg(s: Settings, presence: Presence): Cfg {
  const talk = s['talk'] !== false && presence.mode !== 'remote-text';
  const clueRoundsRaw = pickOf(s, 'clueRounds', ['auto', '1', '2', '3'] as const, 'auto');
  return {
    rounds: num(s, 'rounds', 3, 1, 8),
    imposters: pickOf(s, 'imposters', ['auto', '1', '2'] as const, 'auto'),
    clueRounds: clueRoundsRaw === 'auto' ? (talk ? 1 : 2) : Number(clueRoundsRaw),
    clueSeconds: num(s, 'clueSeconds', 40, 20, 90),
    talk,
    talkSeconds: num(s, 'talkSeconds', 60, 30, 180),
    voteSeconds: num(s, 'voteSeconds', 30, 15, 60),
    hint: pickOf(s, 'hint', ['category', 'none'] as const, 'category'),
    lastChance: pickOf(s, 'lastChance', ['choices', 'typed', 'off'] as const, 'choices'),
    categories: multiselectPicks(s['categories']),
    spicy: s['spicy'] === true,
    reader: String(s['reader'] ?? 'george'),
  };
}

/** Seated players who have not left the game. */
export function activeSeats(state: State): string[] {
  return state.seats.filter((id) => !state.left.includes(id));
}

/** How many imposters this round: auto = 2 at 10+, and two always needs 7+ (SPEC §1.12). */
export function imposterCount(cfg: Cfg, seated: number): number {
  const want = cfg.imposters === 'auto' ? (seated >= 10 ? 2 : 1) : Number(cfg.imposters);
  return want === 2 && seated >= 7 ? 2 : 1;
}

/** Draws this round's imposters from the bag, refilling it by seeded shuffle when it runs dry. */
export function drawImposters(state: State, count: number): State {
  const seated = activeSeats(state);
  let bag = state.imposterBag.filter((id) => seated.includes(id));
  let rng = state.rng;
  const picked: string[] = [];
  while (picked.length < Math.min(count, seated.length)) {
    if (bag.length === 0) {
      const [refill, next] = shuffle(
        rng,
        seated.filter((id) => !picked.includes(id)),
      );
      bag = refill;
      rng = next;
      if (bag.length === 0) break;
    }
    const [id, ...rest] = bag;
    bag = rest;
    if (id !== undefined && !picked.includes(id)) picked.push(id);
  }
  return { ...state, rng, imposterBag: bag, round: { ...state.round, imposters: picked } };
}

export function blankRound(n: number, w: number, category: Round['category']): Round {
  return {
    n,
    w,
    category,
    imposters: [],
    clueRound: 1,
    clues: [],
    revealOrder: [],
    revealed: 0,
    ready: [],
    votes: {},
    runoff: null,
    showing: 'main',
    accused: [],
    spot: 0,
    flipped: false,
    options: null,
    guesses: {},
    delta: {},
    void: false,
    step: 0,
    rejects: {},
  };
}

export function isImposter(state: State, id: string): boolean {
  return state.round.imposters.includes(id);
}

export function wordOf(state: State): State['words'][number] | undefined {
  return state.words[state.round.w];
}

/** Clues already on the board: every earlier clue round, plus this one's revealed cards. */
export function boardClues(state: State): Clue[] {
  const r = state.round;
  const shown = new Set(r.revealOrder.slice(0, r.revealed));
  return r.clues.filter((c) => c.r < r.clueRound || (c.r === r.clueRound && shown.has(c.by)));
}

/** True once this clue round's cards have all been dealt (talk, vote and later). */
export function allRevealed(state: State): boolean {
  const p = state.phase.id;
  return !(p === 'deal' || p === 'clue' || p === 'clueReveal' || p === 'intro');
}

/** Everything the board shows right now, grouped by author in seat order. */
export function boardByAuthor(state: State): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const clues = allRevealed(state) ? state.round.clues : boardClues(state);
  for (const c of [...clues].sort((a, b) => a.r - b.r)) (out[c.by] ??= []).push(c.text);
  return out;
}

/** This clue round's clue from `id`, if any. */
export function clueOf(state: State, id: string): Clue | undefined {
  return state.round.clues.find((c) => c.by === id && c.r === state.round.clueRound);
}

/** The players whose clues are still to be judged: seated, not left (spectators never vote). */
export function voters(state: State): string[] {
  return activeSeats(state);
}

/** Every imposter left the game (SPEC §1.15: the round is void). */
export function impostersAllLeft(state: State): boolean {
  const imps = state.round.imposters;
  return imps.length > 0 && imps.every((id) => state.left.includes(id));
}
