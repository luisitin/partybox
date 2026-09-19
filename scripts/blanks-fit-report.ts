// The fit report for a Blanks deck (owner, 2026-09-18: "run simulations and assess how well the
// cards fit"): what the deck's black cards ask for and what its white cards serve, then N
// simulated games replayed event by event to measure every hand at every answer — how many cards
// serve the round's slot, how many are tier-3, and how well the bots' plays fit — so each change
// to the decks, the dealing or the bots has a number.
// Usage: tsx scripts/blanks-fit-report.ts [--decks wild-only] [--players 6] [--runs 30] [--seed 1]
import { parseArgs } from 'node:util';
import { runGame } from '../packages/sim/src/runner';
import { DECKS, blackCard, decksFor } from '../games/blanks/server/content';
import { game } from '../games/blanks/server/index';
import { fitScore, servesOf, slotOf, SLOTS } from '../games/blanks/server/fit';
import type { DeckPreset, Input, State } from '../games/blanks/server/types';
import type { GameEvent } from '@partybox/game-sdk';

const { values } = parseArgs({
  options: {
    decks: { type: 'string', default: 'wild-only' },
    players: { type: 'string', default: '6' },
    runs: { type: 'string', default: '30' },
    seed: { type: 'string', default: '1' },
  },
});
const preset = values.decks as DeckPreset;
const players = Number(values.players);
const runs = Number(values.runs);
const seed0 = Number(values.seed);

const pct = (n: number, d: number): string => `${d ? ((100 * n) / d).toFixed(1) : '0.0'} %`;
const count = <K extends string>(keys: readonly K[]): Record<K, number> =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;

// 1. The deck's shape.
const decks = decksFor(preset).map((d) => DECKS[d]);
const blacks = decks.flatMap((d) => d.black);
const whites = decks.flatMap((d) => d.white);
const slotN = count(SLOTS);
for (const b of blacks) slotN[slotOf(b)] += 1;
const serveN = count(SLOTS);
const tierN = count(['1', '2', '3'] as const);
const serves = new Map(whites.map((w) => [w.id, servesOf(w)]));
const tiers = new Map(whites.map((w) => [w.id, w.tier ?? 2]));
for (const w of whites) {
  for (const s of serves.get(w.id) ?? []) serveN[s] += 1;
  tierN[String(tiers.get(w.id)) as '1' | '2' | '3'] += 1;
}
console.log(`decks ${preset}: ${blacks.length} black, ${whites.length} white`);
console.log(
  `  black slots: ${SLOTS.map((s) => `${s} ${slotN[s]} (${pct(slotN[s], blacks.length)})`).join(' · ')}`,
);
console.log(
  `  white serves: ${SLOTS.map((s) => `${s} ${serveN[s]} (${pct(serveN[s], whites.length)})`).join(' · ')}`,
);
console.log(
  `  white tiers: ${(['1', '2', '3'] as const).map((t) => `${t}: ${tierN[t]} (${pct(tierN[t], whites.length)})`).join(' · ')}`,
);

// 2. Simulated games, replayed: hands at every answer phase + the bots' plays.
let hands = 0;
let handsShortOfSlot = 0; // fewer than 2 cards serving the round's slot
const shortBySlot = count(SLOTS);
const roundsBySlot = count(SLOTS);
let goodCards = 0; // tier 3 cards across hands
let handsHalfGood = 0; // ≥ half the hand tier 3
let serveCards = 0; // cards serving the round's slot across hands
let plays = 0;
let playFit = 0; // sum of fit scores of the cards bots played
let playTier = 0;
let bestFit = 0; // the best fit the hand offered
let playServes = 0; // plays whose card serves the slot
for (let r = 0; r < runs; r += 1) {
  const result = runGame(game as never, {
    seed: seed0 + r,
    players,
    strategy: 'fast',
    settings: { rounds: 8, judge: 'vote', decks: preset, timed: true, answerSeconds: 30 },
  });
  let state = game.init({
    players: result.init.players,
    settings: result.init.settings as never,
    seed: result.init.seed,
    now: result.init.now,
  });
  let seenAnswer = '';
  for (const ev of result.events as GameEvent<Input>[]) {
    const before: State = state;
    state = game.reduce(state, ev);
    if (state.phase.id === 'answer' && state.blackId !== null) {
      const key = `${state.round}`;
      const slot = slotOf(blackCard(state.blackId));
      if (seenAnswer !== key) {
        seenAnswer = key;
        roundsBySlot[slot] += 1;
        for (const id of Object.keys(state.hands)) {
          const hand = state.hands[id] ?? [];
          hands += 1;
          const serving = hand.filter((c) => (serves.get(c) ?? []).includes(slot)).length;
          serveCards += serving;
          if (serving < 2) {
            handsShortOfSlot += 1;
            shortBySlot[slot] += 1;
          }
          const good = hand.filter((c) => tiers.get(c) === 3).length;
          goodCards += good;
          if (good * 2 >= hand.length) handsHalfGood += 1;
        }
      }
      if (ev.type === 'input' && ev.input.type === 'play' && before.phase.id === 'answer') {
        const hand = before.hands[ev.playerId] ?? [];
        const best = Math.max(0, ...hand.map((c) => fitScore(slot, serves.get(c) ?? [])));
        for (const c of ev.input.cards) {
          plays += 1;
          const f = fitScore(slot, serves.get(c) ?? []);
          playFit += f;
          playTier += tiers.get(c) ?? 2;
          bestFit += best;
          if ((serves.get(c) ?? []).includes(slot)) playServes += 1;
        }
      }
    }
  }
}
console.log(`${runs} games × ${players} players, ${hands} hands at answer:`);
console.log(
  `  rounds by slot: ${SLOTS.map((s) => `${s} ${roundsBySlot[s]}`).join(' · ')}; hands with < 2 cards serving the round's slot: ${handsShortOfSlot} (${pct(handsShortOfSlot, hands)}) — ${SLOTS.map((s) => `${s} ${shortBySlot[s]}`).join(' · ')}`,
);
console.log(
  `  cards serving the slot per hand: ${(serveCards / Math.max(1, hands)).toFixed(2)}; tier-3 per hand: ${(goodCards / Math.max(1, hands)).toFixed(2)}; hands at least half tier-3: ${pct(handsHalfGood, hands)}`,
);
console.log(
  `  bot plays: ${plays}; mean fit ${(playFit / Math.max(1, plays)).toFixed(3)} (best on offer ${(bestFit / Math.max(1, plays)).toFixed(3)}); serving the slot ${pct(playServes, plays)}; mean tier ${(playTier / Math.max(1, plays)).toFixed(2)}`,
);
