// Live events (the owner's picks 2026-09-25, docs/game-pack/blind-auction/LIVE-EVENTS.md): a round
// the TV plays out instead of a box. Each event is still a box to bet on: its outcomes are the
// options (a racer, a dice call, a wheel prize) with their chances and pays, and `detail` says how
// it plays out (secret until `open`, like the outcome). The TV animates from outcome + detail only.
import { nextFloat, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { drawOutcome } from './draw';
import { payOf } from './odds';
import { KENO_DRAW, KENO_NUMBERS } from './timing';
import type { Box, BoxOption, LiveKind, Round } from './types';

interface Label {
  icon: string;
  name: string;
}

/** Racers: four run each race, a new four every time. */
export const RACERS: readonly Label[] = [
  { icon: '🐢', name: 'Turtle' },
  { icon: '🐇', name: 'Rabbit' },
  { icon: '🦆', name: 'Duck' },
  { icon: '🐌', name: 'Snail' },
  { icon: '🐎', name: 'Horse' },
  { icon: '🐖', name: 'Pig' },
  { icon: '🦩', name: 'Flamingo' },
  { icon: '🐿️', name: 'Squirrel' },
  { icon: '🦔', name: 'Hedgehog' },
  { icon: '🐓', name: 'Rooster' },
];

/** The race's odds, favourite first (the racers take them in a random order). */
const RACE_CHANCES = [40, 30, 20, 10];

/** Two dice: under 7, exactly 7, over 7 (15, 6 and 15 of 36, shown in whole %). */
const DICE_OPTIONS: readonly (Label & { chance: number })[] = [
  { icon: '⬇️', name: 'Under 7', chance: 42 },
  { icon: '🍀', name: 'Lucky 7', chance: 16 },
  { icon: '⬆️', name: 'Over 7', chance: 42 },
];

/** Wheel prizes: four to six on each spin, a random few from the pool. */
export const PRIZES: readonly Label[] = [
  { icon: '💰', name: 'Gold' },
  { icon: '💎', name: 'Diamond' },
  { icon: '👑', name: 'Crown' },
  { icon: '🍕', name: 'Pizza' },
  { icon: '🚀', name: 'Rocket' },
  { icon: '🎸', name: 'Guitar' },
  { icon: '🦄', name: 'Unicorn' },
  { icon: '🍩', name: 'Donut' },
  { icon: '🏆', name: 'Trophy' },
  { icon: '🎩', name: 'Top hat' },
  { icon: '🌮', name: 'Taco' },
  { icon: '🧸', name: 'Teddy' },
  { icon: '🍀', name: 'Clover' },
  { icon: '🔔', name: 'Bell' },
  { icon: '🎁', name: 'Gift' },
  { icon: '⭐', name: 'Star' },
  { icon: '🐙', name: 'Octopus' },
  { icon: '🍒', name: 'Cherries' },
  { icon: '🪩', name: 'Disco ball' },
  { icon: '🦖', name: 'Dino' },
];

/** Wheel slices by prize count: big and small slices, whole % adding to 100. */
const WHEEL_CHANCES: Record<number, number[]> = {
  4: [45, 30, 15, 10],
  5: [40, 25, 15, 12, 8],
  6: [35, 25, 15, 10, 10, 5],
};

/** Three doors, one car: a right door pays ×2 (the owner's call), whichever door you end on. */
const DOORS: readonly Label[] = [
  { icon: '🚪', name: 'Door 1' },
  { icon: '🚪', name: 'Door 2' },
  { icon: '🚪', name: 'Door 3' },
];
export const DOOR_PAY = 2;

const EVENT_BOX: Record<LiveKind, { name: string; icon: string; flavour: string }> = {
  blackjack: {
    name: 'Blackjack',
    icon: '🃏',
    flavour: 'Beat the dealer without going over 21. Win ×2, blackjack ×2.5.',
  },
  ghost: {
    name: 'Ghost Hunt',
    icon: '👻',
    flavour: 'A ghost hides in one of four rooms. Right room pays ×4.',
  },
  wires: {
    name: 'Defuse the Bomb',
    icon: '💣',
    flavour: 'Four wires, one stops the bomb. Pick it: ×4.',
  },
  penalty: {
    name: 'Penalty Kick',
    icon: '⚽',
    flavour: 'One shot, one keeper. Goal, save, or off the post?',
  },
  keno: {
    name: 'Lucky Numbers',
    icon: '🎱',
    flavour: 'Pick three numbers. Five balls drop. Match them all for ×30!',
  },
  coins: {
    name: 'Coin Streak',
    icon: '🪙',
    flavour: 'Heads, heads, heads… how long before tails?',
  },
  shells: {
    name: 'Shell Game',
    icon: '🥤',
    flavour: 'Stake the pot, follow the ball. The bigger the pot, the faster the cups.',
  },
  tug: {
    name: 'Tug of War',
    icon: '🪢',
    flavour: 'Two teams, one rope. Bet on your side, then tap to pull!',
  },
  potato: {
    name: 'Hot Potato',
    icon: '🥔',
    flavour: 'Tap to pass it on. Who is holding it when it pops?',
  },
  race: { name: 'Animal Race', icon: '🏁', flavour: 'Four racers, one finish line. Who wins?' },
  dice: { name: 'Dice Roll', icon: '🎲', flavour: 'Two dice. Under seven, lucky seven, or over?' },
  wheel: { name: 'Prize Wheel', icon: '🎡', flavour: 'Round and round it goes. Where it stops…' },
  doors: {
    name: 'Three Doors',
    icon: '🚪',
    flavour: 'A car behind one, goats behind two. Stay or switch?',
  },
};

function option(label: Label, chance: number): BoxOption {
  return { kind: 'pick', chance, pay: payOf(chance), label };
}

function eventBox(kind: LiveKind, n: number, options: BoxOption[]): Box {
  return { id: `live-${kind}-${n}`, ...EVENT_BOX[kind], options, grand: false, event: kind };
}

function int(rng: RngState, below: number): [number, RngState] {
  const [f, next] = nextFloat(rng);
  return [Math.min(below - 1, Math.floor(f * below)), next];
}

function race(rng: RngState, n: number): [Round, RngState] {
  const [cast, s1] = shuffle(rng, RACERS);
  const [chances, s2] = shuffle(s1, RACE_CHANCES);
  const options = cast.slice(0, 4).map((r, i) => option(r, chances[i] ?? 10));
  const [outcome, s3] = drawOutcome(s2, options);
  // Finishing order: the winner, then the rest in a random order.
  const [rest, s4] = shuffle(
    s3,
    options.map((_, i) => i).filter((i) => i !== outcome),
  );
  return [{ box: eventBox('race', n, options), outcome, detail: [outcome, ...rest] }, s4];
}

function dice(rng: RngState, n: number): [Round, RngState] {
  const options = DICE_OPTIONS.map((d) => option({ icon: d.icon, name: d.name }, d.chance));
  const [a, s1] = int(rng, 6);
  const [b, s2] = int(s1, 6);
  const sum = a + b + 2;
  const outcome = sum < 7 ? 0 : sum === 7 ? 1 : 2;
  return [{ box: eventBox('dice', n, options), outcome, detail: [a + 1, b + 1] }, s2];
}

function wheel(rng: RngState, n: number): [Round, RngState] {
  const [count0, s1] = int(rng, 3);
  const count = count0 + 4;
  const [pool, s2] = shuffle(s1, PRIZES);
  const chances = WHEEL_CHANCES[count] ?? [45, 30, 15, 10];
  const options = pool.slice(0, count).map((p, i) => option(p, chances[i] ?? 5));
  const [outcome, s3] = drawOutcome(s2, options);
  // Where in its slice the pointer stops (0–99 % of the slice), so no two spins look alike.
  const [at, s4] = int(s3, 80);
  return [{ box: eventBox('wheel', n, options), outcome, detail: [at + 10] }, s4];
}

function doors(rng: RngState, n: number): [Round, RngState] {
  const options = DOORS.map((d, i) => ({ ...option(d, i === 2 ? 34 : 33), pay: DOOR_PAY }));
  const [outcome, s1] = int(rng, 3);
  return [{ box: eventBox('doors', n, options), outcome }, s1];
}

/** Coin-flip streak: how many heads before the first tails? (tails first 50 %, 1–2 heads 37.5 %,
 *  3 or more 12.5 % — shown in whole %). `detail` = the flips, 1 heads / 0 tails, ending on tails
 *  (at most 6 flips: a sixth heads ends the streak there). */
const STREAKS: readonly (Label & { chance: number })[] = [
  { icon: '🪙', name: 'Tails first', chance: 50 },
  { icon: '🔥', name: '1 or 2 heads', chance: 38 },
  { icon: '🚀', name: '3+ heads', chance: 12 },
];

function coins(rng: RngState, n: number): [Round, RngState] {
  const options = STREAKS.map((s) => option({ icon: s.icon, name: s.name }, s.chance));
  const flips: number[] = [];
  let state = rng;
  for (let i = 0; i < 6; i++) {
    const [f, next] = nextFloat(state);
    state = next;
    const heads = f < 0.5 ? 1 : 0;
    flips.push(heads);
    if (!heads) break;
  }
  const streak = flips.filter((f) => f === 1).length;
  const outcome = streak === 0 ? 0 : streak <= 2 ? 1 : 2;
  return [{ box: eventBox('coins', n, options), outcome, detail: flips }, state];
}

/** Penalty shootout: one kick. Goal (70 %), saved (22 %), off the post or wide (8 %). `detail` =
 *  [where the shot goes (0 left, 1 middle, 2 right), where the keeper dives]. A goal: the keeper
 *  went the other way; saved: the same way; wide: the shot sails past the post. */
const KICKS: readonly (Label & { chance: number })[] = [
  { icon: '⚽', name: 'Goal', chance: 70 },
  { icon: '🧤', name: 'Saved', chance: 22 },
  { icon: '🥅', name: 'Off the post', chance: 8 },
];

function penalty(rng: RngState, n: number): [Round, RngState] {
  const options = KICKS.map((k) => option({ icon: k.icon, name: k.name }, k.chance));
  const [outcome, s1] = drawOutcome(rng, options);
  const [shot, s2] = int(s1, 3);
  const [other, s3] = int(s2, 2);
  const away = [0, 1, 2].filter((d) => d !== shot)[other] ?? 0;
  const keeper = outcome === 1 ? shot : away;
  // Wide: the shot aims for a corner and misses it.
  const aim = outcome === 2 ? (shot === 1 ? 2 : shot) : shot;
  return [{ box: eventBox('penalty', n, options), outcome, detail: [aim, keeper] }, s3];
}

/** Ghost hunt and defuse the bomb (the owner: rules and payouts clear before; no adding to a bet
 *  at the last wire — so the bets close first and the TV plays it out): four rooms / wires, one
 *  right. `detail` = the order the others are checked (the right one last). */
const ROOMS: readonly Label[] = [
  { icon: '🛏️', name: 'Bedroom' },
  { icon: '🍳', name: 'Kitchen' },
  { icon: '🛁', name: 'Bathroom' },
  { icon: '📦', name: 'Attic' },
];
const WIRES: readonly Label[] = [
  { icon: '🔴', name: 'Red wire' },
  { icon: '🔵', name: 'Blue wire' },
  { icon: '🟡', name: 'Yellow wire' },
  { icon: '🟢', name: 'Green wire' },
];

function fourWay(kind: 'ghost' | 'wires', rng: RngState, n: number): [Round, RngState] {
  const labels = kind === 'ghost' ? ROOMS : WIRES;
  const options = labels.map((l) => option(l, 25));
  const [outcome, s1] = int(rng, 4);
  const [order, s2] = shuffle(
    s1,
    [0, 1, 2, 3].filter((i) => i !== outcome),
  );
  return [{ box: eventBox(kind, n, options), outcome, detail: order }, s2];
}

/** Blackjack: one "option" (you play your hand, not a card); the deal happens at `hands`. */
function blackjack(n: number): Round {
  const options = [{ ...option({ icon: '🃏', name: 'Beat the dealer' }, 100), pay: 0 }];
  return { box: eventBox('blackjack', n, options), outcome: 0 };
}

/** Keno: one "option" (you play your numbers, not a card); the draw is `detail`. */
function keno(rng: RngState, n: number): [Round, RngState] {
  const [pool, next] = shuffle(
    rng,
    Array.from({ length: KENO_NUMBERS }, (_, i) => i + 1),
  );
  const drawn = pool.slice(0, KENO_DRAW);
  const options = [{ ...option({ icon: '🎱', name: 'Your numbers' }, 100), pay: 0 }];
  return [{ box: eventBox('keno', n, options), outcome: 0, detail: drawn }, next];
}

/** Shell game: three cups; everyone stakes into one pot first, picks a cup after the shuffle. */
const CUPS: readonly Label[] = [
  { icon: '🥤', name: 'Cup 1' },
  { icon: '🥤', name: 'Cup 2' },
  { icon: '🥤', name: 'Cup 3' },
];

function shells(rng: RngState, n: number): [Round, RngState] {
  // pay 0: a shared pot, split by stake (returns.ts), not odds.
  const options = CUPS.map((c, i) => ({ ...option(c, i === 2 ? 34 : 33), pay: 0 }));
  const [start, s1] = int(rng, 3);
  return [{ box: eventBox('shells', n, options), outcome: start, detail: [start] }, s1];
}

/** Tug of war: bet on your own team (▲ Sun or ● Moon, dealt at `init`), even odds. */
const TEAMS: readonly Label[] = [
  { icon: '▲', name: 'Sun' },
  { icon: '●', name: 'Moon' },
];

function tug(rng: RngState, n: number): [Round, RngState] {
  const options = TEAMS.map((t) => option(t, 50));
  return [{ box: eventBox('tug', n, options), outcome: 0 }, rng];
}

/** Hot potato: its options are the players, filled in at `init` (potatoOptions) — here, none. */
function potato(rng: RngState, n: number): [Round, RngState] {
  return [{ box: eventBox('potato', n, []), outcome: 0 }, rng];
}

/** One option per player (seat order): equal chances in whole %, adding to 100. */
export function potatoOptions(names: readonly string[]): BoxOption[] {
  const n = Math.max(1, names.length);
  const base = Math.floor(100 / n);
  return names.map((name, i) => ({
    ...option({ icon: '🔥', name }, base + (i < 100 - base * n ? 1 : 0)),
    pay: payOf(base),
  }));
}

export function drawEvent(kind: LiveKind, rng: RngState, n: number): [Round, RngState] {
  if (kind === 'race') return race(rng, n);
  if (kind === 'dice') return dice(rng, n);
  if (kind === 'doors') return doors(rng, n);
  if (kind === 'potato') return potato(rng, n);
  if (kind === 'tug') return tug(rng, n);
  if (kind === 'shells') return shells(rng, n);
  if (kind === 'coins') return coins(rng, n);
  if (kind === 'keno') return keno(rng, n);
  if (kind === 'penalty') return penalty(rng, n);
  if (kind === 'blackjack') return [blackjack(n), rng];
  if (kind === 'ghost' || kind === 'wires') return fourWay(kind, rng, n);
  return wheel(rng, n);
}
