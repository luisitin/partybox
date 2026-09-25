// Typed access to content/*.json and the draws made from it. Host-only: the client never imports
// this (foundation §2.5); a game's state holds only the questions it drew.
import { shuffle } from '@partybox/game-sdk';
import { parsePronunciations } from '@partybox/game-sdk/speech';
import type { RngState } from '@partybox/game-sdk';
import familyJson from '../content/family.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import { packSchema } from '../content/schema';
import type { AnswerItem, Pack, QuestionItem } from '../content/schema';
import type { Settings, Tile } from './types';

// Parsed once at module load: a broken pack fails at import time (and in the contract suite).
export const FAMILY: Pack = packSchema.parse(familyJson);
export const SPICY: Pack = packSchema.parse(spicyJson);
export const PRONUNCIATIONS = parsePronunciations(pronunciationsJson);
export const LANG = FAMILY.lang;

/** Draws the game's questions: `maxQuestions` from the family pack, plus the spicy one when on. */
export function drawQuestions(rng: RngState, cfg: Settings): [QuestionItem[], RngState] {
  const pool = cfg.spicy ? [...FAMILY.items, ...SPICY.items] : FAMILY.items;
  const [order, next] = shuffle(rng, pool);
  return [order.slice(0, cfg.maxQuestions), next];
}

/** The tile's text: the answer's casing when the pack gives one, else capitalised. */
export function answerLabel(a: AnswerItem): string {
  if (a.display) return a.display;
  return a.answer.charAt(0).toUpperCase() + a.answer.slice(1);
}

/** Eight tiles: the top five by weight, three more drawn from the rest, shuffled (§2.15).
 *  A would-you-rather ("tiles": "all") shows every answer, in the order the question says them. */
export function tilesFor(rng: RngState, item: QuestionItem): [Tile[], RngState] {
  const tile = (a: AnswerItem): Tile => ({ id: a.id, label: answerLabel(a) });
  if (item.tiles === 'all') return [item.answers.map(tile), rng];
  const byWeight = item.answers
    .map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.weight - x.a.weight || x.i - y.i)
    .map((x) => x.a);
  const [rest, afterRest] = shuffle(rng, byWeight.slice(5));
  const [tiles, next] = shuffle(afterRest, [...byWeight.slice(0, 5), ...rest.slice(0, 3)]);
  return [tiles.map(tile), next];
}
