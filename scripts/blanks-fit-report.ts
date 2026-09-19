// The fit report for a Blanks deck (owner, 2026-09-18: "run simulations and assess how well the
// cards fit"): what the deck's black cards ask for and what its white cards serve, then N
// simulated games replayed event by event to measure every hand at every answer — how many cards
// serve the round's slot, how many are tier-3, and how well the bots' plays fit — so each change
// to the decks, the dealing or the bots has a number.
// Usage: tsx scripts/blanks-fit-report.ts [--decks wild-only] [--players 6] [--runs 30] [--seed 1]
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { runGame } from '../packages/sim/src/runner';
import { DECKS, blackCard, blackTier, decksFor, whiteText } from '../games/blanks/server/content';
import { fillText } from '../games/blanks/server/cards';
import { TOPIC_HIT, WORD_ECHO, pairBonus, topicsOf } from '../games/blanks/server/topics';
import { game } from '../games/blanks/server/index';
import { fitScore, servesOf, slotOf, slotsOf, SLOTS } from '../games/blanks/server/fit';
import type { Slot } from '../games/blanks/server/fit';
import type { DeckPreset, Input, State } from '../games/blanks/server/types';
import type { GameEvent } from '@partybox/game-sdk';

const { values } = parseArgs({
  options: {
    decks: { type: 'string', default: 'wild-only' },
    players: { type: 'string', default: '6' },
    runs: { type: 'string', default: '30' },
    seed: { type: 'string', default: '1' },
    /** Print this many sample rounds — the prompt with every bot's play filled in — to read. */
    sample: { type: 'string', default: '0' },
    /** Also write a Markdown review of the deck (prompts by kind, whites by kind and tier) here. */
    md: { type: 'string' },
    /** Print this many hands as a player sees them: the prompt, then the first four cards. */
    hands: { type: 'string', default: '0' },
  },
});
const sampleN = Number(values.sample);
const handsN = Number(values.hands);
const handSamples: string[] = [];
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
const tierN = count(['1', '2', '3', '4'] as const);
const serves = new Map(whites.map((w) => [w.id, servesOf(w)]));
const tiers = new Map(whites.map((w) => [w.id, w.tier ?? 2]));
for (const w of whites) {
  for (const s of serves.get(w.id) ?? []) serveN[s] += 1;
  tierN[String(tiers.get(w.id)) as '1' | '2' | '3' | '4'] += 1;
}
console.log(`decks ${preset}: ${blacks.length} black, ${whites.length} white`);
console.log(
  `  black slots: ${SLOTS.map((s) => `${s} ${slotN[s]} (${pct(slotN[s], blacks.length)})`).join(' · ')}`,
);
console.log(
  `  white serves: ${SLOTS.map((s) => `${s} ${serveN[s]} (${pct(serveN[s], whites.length)})`).join(' · ')}`,
);
console.log(
  `  white tiers: ${(['1', '2', '3', '4'] as const).map((t) => `${t}: ${tierN[t]} (${pct(tierN[t], whites.length)})`).join(' · ')}`,
);

// 2. Simulated games, replayed: hands at every answer phase + the bots' plays.
let prompts = 0;
let promptTier = 0; // sum of the tiers of the prompts played
const samples: string[] = [];
let hands = 0;
let handsShortOfSlot = 0; // fewer than 2 cards serving the round's slot
const shortBySlot = count(SLOTS);
const roundsBySlot = count(SLOTS);
let goodCards = 0; // tier 3+ cards across hands
let bestCards = 0; // tier 4 cards across hands
let handsHalfGood = 0; // ≥ half the hand tier 3+
let serveCards = 0; // cards serving the round's slot across hands
let topFit = 0; // mean fit of the first four cards (the phone's first screenful), summed over hands
let topGood = 0; // tier-3 cards among the first four, summed over hands
let clumpy = 0; // hands where four or more cards share a topic
let clumpTop = 0; // the largest single-topic group, summed over hands
let handFit = 0; // mean fit of the whole hand, summed over hands (what an unsorted first four would show)
let plays = 0;
let hits = 0; // plays on the prompt's topic in other words
let echoes = 0; // plays that repeat the prompt's own word
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
        prompts += 1;
        promptTier += blackTier(state.blackId);
        for (const id of Object.keys(state.hands)) {
          const hand = state.hands[id] ?? [];
          hands += 1;
          const serving = hand.filter((c) => (serves.get(c) ?? []).includes(slot)).length;
          serveCards += serving;
          const top = hand.slice(0, 4);
          if (handSamples.length < handsN)
            handSamples.push(
              [
                `[${slot}] ${blackCard(state.blackId).text}`,
                ...top.map((c) => `      ${'★'.repeat(tiers.get(c) ?? 2)} ${whiteText(c)}`),
              ].join(String.fromCharCode(10)),
            );
          topFit +=
            top.reduce((sum, c) => sum + fitScore(slot, serves.get(c) ?? [], whiteText(c)), 0) /
            Math.max(1, top.length);
          topGood += top.filter((c) => (tiers.get(c) ?? 2) >= 3).length;
          const byTopic = new Map<string, number>();
          for (const c of hand)
            for (const t of topicsOf(whiteText(c))) byTopic.set(t, (byTopic.get(t) ?? 0) + 1);
          // The wild deck is about sex the way the mild deck is about family: the deck's own
          // subject is not a clump, so the biggest OTHER topic is what counts.
          const biggest = Math.max(
            0,
            ...[...byTopic].filter(([t]) => t !== 'sex').map(([, n]) => n),
          );
          clumpTop += biggest;
          if (biggest >= 4) clumpy += 1;
          handFit +=
            hand.reduce((sum, c) => sum + fitScore(slot, serves.get(c) ?? [], whiteText(c)), 0) /
            Math.max(1, hand.length);
          if (serving < 2) {
            handsShortOfSlot += 1;
            shortBySlot[slot] += 1;
          }
          const good = hand.filter((c) => (tiers.get(c) ?? 2) >= 3).length;
          goodCards += good;
          bestCards += hand.filter((c) => tiers.get(c) === 4).length;
          if (good * 2 >= hand.length) handsHalfGood += 1;
        }
      }
      if (ev.type === 'input' && ev.input.type === 'play' && before.phase.id === 'answer') {
        const hand = before.hands[ev.playerId] ?? [];
        const blankSlots = slotsOf(blackCard(state.blackId));
        const slotAt = (i: number): Slot => blankSlots[i] ?? slot;
        if (samples.length < sampleN * players) {
          const black = blackCard(state.blackId);
          const mark = (c: string): string => {
            const b = pairBonus(black.text, whiteText(c));
            return b === TOPIC_HIT ? '†' : b === WORD_ECHO ? '↩' : '';
          };
          const line = `[${blankSlots.join('+')}${'★'.repeat(blackTier(state.blackId))}] ${fillText(black.text, ev.input.cards.map(whiteText))}  ← ${ev.input.cards.map((c, i) => `${tiers.get(c) ?? 2}/${fitScore(slotAt(i), serves.get(c) ?? [], whiteText(c)).toFixed(2)}${mark(c)}`).join(' ')}`;
          samples.push(line);
        }
        ev.input.cards.forEach((c, i) => {
          const s = slotAt(i);
          const best = Math.max(
            0,
            ...hand.map((h) => fitScore(s, serves.get(h) ?? [], whiteText(h))),
          );
          plays += 1;
          playFit += fitScore(s, serves.get(c) ?? [], whiteText(c));
          playTier += tiers.get(c) ?? 2;
          bestFit += best;
          if ((serves.get(c) ?? []).includes(s)) playServes += 1;
          const b = pairBonus(blackCard(state.blackId).text, whiteText(c));
          if (b === TOPIC_HIT) hits += 1;
          else if (b === WORD_ECHO) echoes += 1;
        });
      }
    }
  }
}
const blackTierN = count(['1', '2', '3'] as const);
for (const b of blacks) blackTierN[String(b.tier ?? 2) as '1' | '2' | '3'] += 1;
console.log(
  `  black tiers: ${(['1', '2', '3'] as const).map((t) => `${t}: ${blackTierN[t]} (${pct(blackTierN[t], blacks.length)})`).join(' · ')}`,
);
console.log(
  `${runs} games × ${players} players, ${hands} hands at answer; prompts played: mean tier ${(promptTier / Math.max(1, prompts)).toFixed(2)}`,
);
console.log(
  `  rounds by slot: ${SLOTS.map((s) => `${s} ${roundsBySlot[s]}`).join(' · ')}; hands with < 2 cards serving the round's slot: ${handsShortOfSlot} (${pct(handsShortOfSlot, hands)}) — ${SLOTS.map((s) => `${s} ${shortBySlot[s]}`).join(' · ')}`,
);
console.log(
  `  the phone's first four cards: mean fit ${(topFit / Math.max(1, hands)).toFixed(3)} (whole hand ${(handFit / Math.max(1, hands)).toFixed(3)}), great among them ${(topGood / Math.max(1, hands)).toFixed(2)}`,
);
console.log(
  `  topic clumps (sex aside): hands with four or more cards on one topic ${pct(clumpy, hands)}; largest group per hand ${(clumpTop / Math.max(1, hands)).toFixed(2)}`,
);
console.log(
  `  cards serving the slot per hand: ${(serveCards / Math.max(1, hands)).toFixed(2)}; great (tier 3+) per hand: ${(goodCards / Math.max(1, hands)).toFixed(2)}, amazing (tier 4) ${(bestCards / Math.max(1, hands)).toFixed(2)}; hands at least half great: ${pct(handsHalfGood, hands)}`,
);
console.log(
  `  bot plays on the prompt's topic (other words): ${pct(hits, plays)}; echoing its word: ${pct(echoes, plays)}`,
);
console.log(
  `  bot plays: ${plays}; mean fit ${(playFit / Math.max(1, plays)).toFixed(3)} (best on offer ${(bestFit / Math.max(1, plays)).toFixed(3)}); serving the slot ${pct(playServes, plays)}; mean tier ${(playTier / Math.max(1, plays)).toFixed(2)}`,
);
if (handSamples.length > 0) {
  console.log("hands as a player sees them — the prompt, then the phone's first four cards:");
  for (const line of handSamples) console.log(`  ${line}`);
}
if (samples.length > 0) {
  console.log('sample plays — [kind, prompt tier] filled prompt ← card tier / fit:');
  for (const line of samples) console.log(`  ${line}`);
}

// 3. The deck review, for reading: every prompt under the kind it wants, every white under the kind
//    it serves, tiers marked — the owner can spot a card the model reads wrong at a glance.
if (values.md) {
  const stars = (t: number | undefined): string => '★'.repeat(t ?? 2);
  const lines: string[] = [
    `# Blanks — the ${preset} deck as the fit model reads it`,
    '',
    `Generated by \`pnpm blanks-fit-report --decks ${preset} --md\`. Kinds: what a prompt's blank wants / what a white card serves (server/fit.ts); ★ = tier (1 filler, 2 good, 3 great, 4 amazing; server/content and the deck JSON).`,
    '',
    '## Prompts by kind',
  ];
  for (const slot of SLOTS) {
    const rows = blacks.filter((b) => slotOf(b) === slot);
    lines.push('', `### ${slot} (${rows.length})`, '');
    for (const b of rows)
      lines.push(
        `- ${stars(b.tier)} ${b.text}${b.slots ? ` _(blanks: ${b.slots.join(', ')})_` : ''}`,
      );
  }
  lines.push('', '## White cards by kind');
  for (const slot of SLOTS) {
    const rows = whites.filter((w) => (serves.get(w.id) ?? [])[0] === slot);
    if (slot === 'name') continue; // only ever a second reading
    lines.push('', `### ${slot} (${rows.length})`, '');
    for (const w of rows)
      lines.push(
        `- ${stars(w.tier)} ${w.text}${(serves.get(w.id) ?? []).length > 1 ? ` _(${(serves.get(w.id) ?? []).slice(1).join(', ')})_` : ''}`,
      );
  }
  writeFileSync(values.md, lines.join(String.fromCharCode(10)) + String.fromCharCode(10), 'utf8');
  console.log(`deck review → ${values.md}`);
}
