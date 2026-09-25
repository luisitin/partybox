// Round setup and the small selectors every phase and view needs: drawing prompts from the deck,
// pairing authors on a seeded cycle, "is this answer blank", "who may vote on this prompt".
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { promptPool, promptText } from './content';
import type { ContentLang } from './content';
import type { RoundPrompt, State } from './types';

/**
 * Prompt i goes to player i and player i+1 (mod n) of a seeded order, so every player writes for
 * exactly two prompts and every prompt has two distinct authors (n >= 2). The pair is shuffled so
 * slot order never hints at the cycle.
 */
export function pairPrompts(
  rng: RngState,
  order: readonly string[],
  promptIds: readonly string[],
  lang?: ContentLang,
): [RoundPrompt[], RngState] {
  const n = order.length;
  let next = rng;
  const prompts: RoundPrompt[] = [];
  promptIds.forEach((id, i) => {
    const a = order[i % n] as string;
    const b = order[(i + 1) % n] as string;
    const [authors, r] = shuffle(next, [a, b]);
    next = r;
    prompts.push({
      id,
      text: promptText(id, lang),
      authors: [authors[0] as string, authors[1] as string],
    });
  });
  return [prompts, next];
}

/** Draws `count` ids from the deck; a deck that runs dry is refilled with a fresh shuffle. */
function draw(state: State, count: number): [string[], string[], RngState] {
  let deck = state.deck;
  let rng = state.rng;
  if (deck.length < count) {
    // Only reachable with packs far smaller than shipped (8 players x 5 rounds = 40 < 150).
    const [refill, r] = shuffle(rng, promptPool(state.settings.spicy));
    rng = r;
    deck = [...deck, ...refill.filter((id) => !deck.includes(id))];
  }
  return [deck.slice(0, count), deck.slice(count), rng];
}

/** Starts round `state.round + 1`: new prompts and pairing, cleared answers and votes. */
export function startRound(state: State): State {
  const ids = Object.keys(state.players).sort();
  const [drawn, deck, r1] = draw(state, ids.length);
  const [order, r2] = shuffle(r1, ids);
  const [prompts, rng] = pairPrompts(r2, order, drawn, state.contentLang);
  return {
    ...state,
    rng,
    deck,
    round: state.round + 1,
    prompts,
    promptIndex: 0,
    answers: {},
    votes: {},
    roundStartScores: { ...state.scores },
  };
}

export function currentPrompt(state: State): RoundPrompt | null {
  return state.prompts[state.promptIndex] ?? null;
}

export function isLastRound(state: State): boolean {
  return state.round >= state.settings.rounds;
}

export function answerOf(state: State, promptId: string, authorId: string): string | null {
  return state.answers[promptId]?.[authorId] ?? null;
}

/** True when neither author answered: such a prompt is never voted on. */
export function bothBlank(state: State, prompt: RoundPrompt): boolean {
  return prompt.authors.every((id) => answerOf(state, prompt.id, id) === null);
}

/** Exactly one of two authors answered: no contest, the real answer wins by default
 *  (a blank used to be votable and could win — review-loop #34). */
export function isWalkover(state: State, prompt: RoundPrompt): boolean {
  const authors = [...new Set(prompt.authors)];
  return (
    authors.length > 1 &&
    authors.filter((id) => answerOf(state, prompt.id, id) === null).length === 1
  );
}

/** Index of the first votable prompt at or after `from`, or -1 when the round's voting is over. */
export function nextVotableIndex(state: State, from: number): number {
  for (let i = Math.max(0, from); i < state.prompts.length; i++) {
    const prompt = state.prompts[i] as RoundPrompt;
    if (!bothBlank(state, prompt)) return i;
  }
  return -1;
}

/** The prompts a player writes for this round, in a stable order. */
export function promptsFor(state: State, playerId: string): RoundPrompt[] {
  return state.prompts.filter((p) => p.authors.includes(playerId));
}

/** Every player who is not an author of the prompt (authors never vote on their own prompt). */
export function eligibleVoters(state: State, prompt: RoundPrompt): string[] {
  return Object.keys(state.players).filter((id) => !prompt.authors.includes(id));
}

export function hasVoted(state: State, promptId: string, voterId: string): boolean {
  return state.votes[promptId]?.[voterId] !== undefined;
}
