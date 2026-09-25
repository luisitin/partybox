// Live events (the owner's picks 2026-09-25, docs/game-pack/blind-auction/LIVE-EVENTS.md): a round
// the TV plays out instead of a box. Each event is still a box to bet on: its outcomes are the
// options (a racer, a dice call, a wheel prize) with their chances and pays, and `detail` says how
// it plays out (secret until `open`, like the outcome). The TV animates from outcome + detail only.
import { nextFloat, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { drawOutcome } from './draw';
import { payOf } from './odds';
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
  return wheel(rng, n);
}
