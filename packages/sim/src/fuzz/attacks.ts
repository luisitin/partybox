// Attack sequences per category, generated from a reachable state. Each attack is a short chain of
// events applied in order; the fuzz runner checks every step. `raw` attacks go through the game's
// inputSchema first (the socket layer does that too): schema-invalid raws must be rejected without
// throwing; accepted ones are applied as inputs.
import type { AnyGameDefinition, GameEvent, GameStateBase, Rng } from '@partybox/shared';
import { normalizeName } from '@partybox/shared';
import { breakShape, hostileContent, hostileLeaf, reshapeKeys, semantic } from './mutate';
import { HOSTILE_STRINGS, hostileIds } from './values';

/** Names the engine would actually let through (normalized, 1-16 code points). */
const HOSTILE_NAMES: readonly string[] = HOSTILE_STRINGS.map((s) => normalizeName(s)).filter(
  (s): s is string => s !== null,
);

export type Category = 'adversarial' | 'hostile-content' | 'schema-shape' | 'chaos-timing';
export const CATEGORIES: readonly Category[] = [
  'adversarial',
  'hostile-content',
  'schema-shape',
  'chaos-timing',
];

export interface Attack {
  category: Category;
  name: string;
  /** Applied in order after the corpus prefix. */
  events: GameEvent<unknown>[];
  /** Inputs in `events` were mutated: skip any the schema rejects (the server would too). */
  validate?: boolean;
  /** schema-shape: the raw value to feed the schema; an input event is built when it passes. */
  raw?: { playerId: string; value: unknown };
  /** hostile-content: swap player names in the state before applying (init copies names as-is). */
  rename?: string;
}

type Ev = GameEvent<unknown>;
const input = (now: number, playerId: string, value: unknown): Ev => ({
  type: 'input',
  now,
  playerId,
  input: value,
});
const timer = (now: number, phaseId: string, startedAt: number): Ev => ({
  type: 'timer',
  now,
  phaseId,
  startedAt,
});
const player = (now: number, playerId: string, connected: boolean): Ev => ({
  type: 'player',
  now,
  playerId,
  connected,
});
const vip = (now: number, action: 'skip' | 'pause' | 'resume' | 'end'): Ev => ({
  type: 'vip',
  now,
  action,
});

export function samplesFor(
  game: AnyGameDefinition,
  state: GameStateBase,
  rng: Rng,
): { id: string; sample: unknown }[] {
  const out: { id: string; sample: unknown }[] = [];
  for (const id of Object.keys(state.players)) {
    try {
      const sample = game.bot.sampleInput(state, id, rng);
      if (sample !== null && sample !== undefined) out.push({ id, sample });
    } catch {
      /* reported by the bot-throws invariant elsewhere */
    }
  }
  return out;
}

function times(state: GameStateBase): { now: number; deadline: number } {
  const now = state.phase.startedAt + 1000;
  const deadline = state.phase.deadline ?? state.phase.startedAt + 60_000;
  return { now, deadline: Math.max(deadline, now + 1) };
}

export function adversarial(game: AnyGameDefinition, state: GameStateBase, rng: Rng): Attack[] {
  const { now, deadline } = times(state);
  const { id: phaseId, startedAt } = state.phase;
  const ids = Object.keys(state.players);
  const out: Attack[] = [];
  const add = (name: string, events: Ev[], validate = false): void => {
    out.push({ category: 'adversarial', name, events, validate });
  };
  const samples = samplesFor(game, state, rng);
  for (const { id, sample } of samples) {
    add(`own input from ${id}`, [input(now, id, sample)]);
    add(`same input twice from ${id}`, [input(now, id, sample), input(now + 1, id, sample)]);
    for (const sender of hostileIds(ids))
      if (sender !== id)
        add(`${id}'s input sent by ${JSON.stringify(sender)}`, [input(now, sender, sample)]);
    add(`input from disconnected ${id}`, [player(now, id, false), input(now + 1, id, sample)]);
    add(`input after the deadline from ${id}`, [input(deadline + 1, id, sample)]);
    add(`input after the timer from ${id}`, [
      timer(deadline, phaseId, startedAt),
      input(deadline + 1, id, sample),
    ]);
    add(`input with now before the phase from ${id}`, [input(startedAt - 5000, id, sample)]);
    add(`input at now=0 from ${id}`, [input(0, id, sample)]);
    add(`input at now=-1 from ${id}`, [input(-1, id, sample)]);
    add(`input at now=2^53 from ${id}`, [input(Number.MAX_SAFE_INTEGER, id, sample)]);
    for (let k = 0; k < 6; k++)
      add(
        `semantic mutation #${k} from ${id}`,
        [input(now, id, semantic(sample, rng, { me: id, players: ids }))],
        true,
      );
    add(`everyone disconnected, then ${id} submits`, [
      ...ids.map((p) => player(now, p, false)),
      input(now + 1, id, sample),
    ]);
  }
  add('timer on time', [timer(deadline, phaseId, startedAt)]);
  add('timer twice', [
    timer(deadline, phaseId, startedAt),
    timer(deadline + 1, phaseId, startedAt),
  ]);
  add('timer stale startedAt', [timer(deadline, phaseId, startedAt - 1)]);
  add('timer future startedAt', [timer(deadline, phaseId, startedAt + 1)]);
  add('timer wrong phase', [timer(deadline, 'nope', startedAt)]);
  add('timer for another declared phase', [
    timer(deadline, game.phases.find((p) => p !== phaseId) ?? phaseId, startedAt),
  ]);
  add('timer early', [timer(startedAt + 1, phaseId, startedAt)]);
  add('timer at now=0', [timer(0, phaseId, startedAt)]);
  add('timer with NaN startedAt', [timer(deadline, phaseId, Number.NaN)]);
  add('pause', [vip(now, 'pause')]);
  add('pause twice', [vip(now, 'pause'), vip(now + 1, 'pause')]);
  add('resume without pause', [vip(now, 'resume')]);
  add('pause, timer, resume, old timer', [
    vip(now, 'pause'),
    timer(deadline, phaseId, startedAt),
    vip(deadline + 5000, 'resume'),
    timer(deadline, phaseId, startedAt),
  ]);
  add('pause then skip', [vip(now, 'pause'), vip(now + 1, 'skip')]);
  add('pause then end', [vip(now, 'pause'), vip(now + 1, 'end')]);
  add('resume earlier than pause', [vip(now, 'pause'), vip(now - 1000, 'resume')]);
  add('skip', [vip(now, 'skip')]);
  add(
    'skip x5',
    Array.from({ length: 5 }, (_, i) => vip(now + i, 'skip')),
  );
  add('end', [vip(now, 'end')]);
  add('end twice', [vip(now, 'end'), vip(now + 1, 'end')]);
  add('end then input', [
    vip(now, 'end'),
    ...samples.slice(0, 1).map(({ id, sample }) => input(now + 1, id, sample)),
  ]);
  add('everyone disconnects, timer', [
    ...ids.map((p) => player(now, p, false)),
    timer(deadline, phaseId, startedAt),
  ]);
  add('everyone disconnects, skip', [
    ...ids.map((p) => player(now, p, false)),
    vip(now + 1, 'skip'),
  ]);
  for (const sender of hostileIds(ids)) {
    add(`player connect ${JSON.stringify(sender)}`, [player(now, sender, true)]);
    add(`player disconnect ${JSON.stringify(sender)}`, [player(now, sender, false)]);
  }
  if (ids[0])
    add(
      'reconnect flap x10',
      Array.from({ length: 10 }, (_, i) => player(now + i, ids[0] as string, i % 2 === 0)),
    );
  return out;
}

export function hostileContentAttacks(
  game: AnyGameDefinition,
  state: GameStateBase,
  rng: Rng,
): Attack[] {
  const { now } = times(state);
  const out: Attack[] = [];
  for (const { id, sample } of samplesFor(game, state, rng)) {
    for (let k = 0; k < 8; k++)
      out.push({
        category: 'hostile-content',
        name: `all leaves hostile #${k} from ${id}`,
        events: [input(now, id, hostileContent(sample, rng))],
        validate: true,
      });
    for (let k = 0; k < 8; k++)
      out.push({
        category: 'hostile-content',
        name: `one leaf hostile #${k} from ${id}`,
        events: [input(now, id, hostileLeaf(sample, rng))],
        validate: true,
      });
    out.push({
      category: 'hostile-content',
      name: `hostile player names, then ${id} submits`,
      events: [input(now, id, sample)],
      rename: rng.pick(HOSTILE_NAMES),
    });
  }
  out.push({
    category: 'hostile-content',
    name: 'hostile player names, timer',
    events: [],
    rename: rng.pick(HOSTILE_STRINGS),
  });
  return out;
}

export function schemaShapeAttacks(
  game: AnyGameDefinition,
  state: GameStateBase,
  rng: Rng,
): Attack[] {
  const out: Attack[] = [];
  const fixed: unknown[] = [
    null,
    undefined,
    0,
    '',
    'string',
    [],
    {},
    true,
    JSON.parse('{"__proto__":{"polluted":true}}') as unknown,
    { constructor: { prototype: { polluted: true } } },
  ];
  for (const { id, sample } of samplesFor(game, state, rng)) {
    fixed.forEach((value, i) =>
      out.push({
        category: 'schema-shape',
        name: `fixed shape #${i} from ${id}`,
        events: [],
        raw: { playerId: id, value },
      }),
    );
    for (let k = 0; k < 10; k++)
      out.push({
        category: 'schema-shape',
        name: `broken shape #${k} from ${id}`,
        events: [],
        raw: { playerId: id, value: breakShape(sample, rng) },
      });
    for (let k = 0; k < 4; k++)
      out.push({
        category: 'schema-shape',
        name: `reshaped keys #${k} from ${id}`,
        events: [],
        raw: { playerId: id, value: reshapeKeys(sample, rng) },
      });
  }
  return out;
}

export function chaosTiming(game: AnyGameDefinition, state: GameStateBase, rng: Rng): Attack[] {
  const { now, deadline } = times(state);
  const { id: phaseId, startedAt } = state.phase;
  const ids = Object.keys(state.players);
  const out: Attack[] = [];
  const add = (name: string, events: Ev[]): void => {
    out.push({ category: 'chaos-timing', name, events });
  };
  const samples = samplesFor(game, state, rng);
  add('timer twice same now', [
    timer(deadline, phaseId, startedAt),
    timer(deadline, phaseId, startedAt),
  ]);
  add('timer 1 ms early then on time', [
    timer(deadline - 1, phaseId, startedAt),
    timer(deadline, phaseId, startedAt),
  ]);
  add('timer far late', [timer(deadline + 86_400_000, phaseId, startedAt)]);
  add('pause across the deadline', [
    vip(deadline - 100, 'pause'),
    timer(deadline, phaseId, startedAt),
    vip(deadline + 10_000, 'resume'),
    timer(deadline + 10_100, phaseId, startedAt),
  ]);
  const flaps: Ev[] = [];
  for (let i = 0; i < 50; i++) flaps.push(vip(now + i * 10, i % 2 === 0 ? 'pause' : 'resume'));
  add('pause/resume x50', flaps);
  add('clock jumps back 1e9', [
    ...samples.slice(0, 1).map(({ id, sample }) => input(now - 1e9, id, sample)),
    timer(0, phaseId, startedAt),
  ]);
  add('clock jumps forward 1e12', [
    ...samples.slice(0, 1).map(({ id, sample }) => input(now + 1e12, id, sample)),
    timer(now + 1e12, phaseId, startedAt),
  ]);
  if (samples.length > 0) {
    const burst: Ev[] = [];
    for (let i = 0; i < 1000; i++) {
      const { id, sample } = samples[i % samples.length] as { id: string; sample: unknown };
      burst.push(input(now, id, sample));
    }
    add('1000 inputs in one tick', burst);
    const a = samples[0] as { id: string; sample: unknown };
    const b = samples[1] ?? a;
    const t = timer(now, phaseId, startedAt);
    add('equal now: input, input, timer', [
      input(now, a.id, a.sample),
      input(now, b.id, b.sample),
      t,
    ]);
    add('equal now: timer, input, input', [
      t,
      input(now, a.id, a.sample),
      input(now, b.id, b.sample),
    ]);
    add('equal now: input, timer, input', [
      input(now, a.id, a.sample),
      t,
      input(now, b.id, b.sample),
    ]);
  }
  add('disconnect everyone at the deadline then timer', [
    ...ids.map((p) => player(deadline, p, false)),
    timer(deadline, phaseId, startedAt),
    ...ids.map((p) => player(deadline + 1, p, true)),
  ]);
  void rng;
  return out;
}

export function attacksFor(
  category: Category,
  game: AnyGameDefinition,
  state: GameStateBase,
  rng: Rng,
): Attack[] {
  switch (category) {
    case 'adversarial':
      return adversarial(game, state, rng);
    case 'hostile-content':
      return hostileContentAttacks(game, state, rng);
    case 'schema-shape':
      return schemaShapeAttacks(game, state, rng);
    case 'chaos-timing':
      return chaosTiming(game, state, rng);
  }
}
