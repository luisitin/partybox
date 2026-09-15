// Input mutators. `hostileContent` keeps every value's JSON type (so the input usually still passes
// the zod schema and reaches `reduce`); `semantic` swaps ids/indices/numbers for plausible-but-wrong
// ones; `breakShape` replaces one node with a wrong-shape value (must be rejected by the schema).
import type { Rng } from '@partybox/shared';
import { hostileNumber, hostileShape, hostileString } from './values';

export type Path = (string | number)[];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Every path to a node in a JSON value, root included as []. */
export function paths(value: unknown, prefix: Path = []): Path[] {
  const out: Path[] = [prefix];
  if (Array.isArray(value)) value.forEach((item, i) => out.push(...paths(item, [...prefix, i])));
  else if (isObject(value))
    for (const [k, v] of Object.entries(value)) out.push(...paths(v, [...prefix, k]));
  return out;
}

export function setAt(value: unknown, path: Path, replacement: unknown): unknown {
  if (path.length === 0) return replacement;
  const [head, ...rest] = path as [string | number, ...Path];
  if (Array.isArray(value)) {
    const copy = [...value];
    copy[head as number] = setAt(copy[head as number], rest, replacement);
    return copy;
  }
  if (isObject(value)) return { ...value, [head]: setAt(value[head as string], rest, replacement) };
  return value;
}

export function getAt(value: unknown, path: Path): unknown {
  let cur: unknown = value;
  for (const key of path) {
    if (Array.isArray(cur)) cur = cur[key as number];
    else if (isObject(cur)) cur = cur[key as string];
    else return undefined;
  }
  return cur;
}

function leafPaths(input: unknown): Path[] {
  return paths(input).filter((p) => {
    const v = getAt(input, p);
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  });
}

/** Replaces every string with a hostile string and every number with a hostile number (same type). */
export function hostileContent(input: unknown, rng: Rng): unknown {
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return hostileString(rng);
    if (typeof v === 'number') return hostileNumber(rng);
    if (Array.isArray(v)) return v.map(walk);
    if (isObject(v)) {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) out[k] = walk(x);
      return out;
    }
    return v;
  };
  return walk(input);
}

/** Replaces ONE leaf with a same-type hostile value (more likely to stay schema-valid). */
export function hostileLeaf(input: unknown, rng: Rng): unknown {
  const leaves = leafPaths(input).filter((p) => typeof getAt(input, p) !== 'boolean');
  if (leaves.length === 0) return input;
  const path = rng.pick(leaves);
  const v = getAt(input, path);
  return setAt(input, path, typeof v === 'string' ? hostileString(rng) : hostileNumber(rng));
}

export interface SemanticContext {
  /** The sender. */
  me: string;
  /** Every id the game knows. */
  players: readonly string[];
}

/**
 * Plausible-but-wrong: string leaves become ids (self, others, unknown) or other string leaves;
 * number leaves become neighbours (±1, 0, -1, huge, fractional); booleans flip. Usually schema-valid.
 */
export function semantic(input: unknown, rng: Rng, ctx: SemanticContext): unknown {
  const leaves = leafPaths(input);
  if (leaves.length === 0) return input;
  const path = rng.pick(leaves);
  const v = getAt(input, path);
  if (typeof v === 'number')
    return setAt(input, path, rng.pick([v + 1, v - 1, 0, -1, 1e9, v + 0.5, -v, 2 ** 31, v * 2]));
  if (typeof v === 'boolean') return setAt(input, path, !v);
  const text = String(v);
  const candidates = [
    ctx.me,
    ...ctx.players,
    'ghost',
    '',
    `${text}${text}`,
    text.toUpperCase(),
    ` ${text} `,
    ...leaves.map((p) => getAt(input, p)).filter((x): x is string => typeof x === 'string'),
  ];
  return setAt(input, path, rng.pick(candidates));
}

/** Replaces one node (root included) with a wrong-shape value. */
export function breakShape(input: unknown, rng: Rng): unknown {
  const path = rng.pick(paths(input));
  return setAt(input, path, hostileShape(rng, getAt(input, path)));
}

/** Adds / removes / swaps keys at the root or a nested object. */
export function reshapeKeys(input: unknown, rng: Rng): unknown {
  const objects = paths(input).filter((p) => isObject(getAt(input, p)));
  if (objects.length === 0) return input;
  const path = rng.pick(objects);
  const obj = getAt(input, path) as Record<string, unknown>;
  const keys = Object.keys(obj);
  const mode = rng.int(0, 3);
  let next: Record<string, unknown>;
  if (mode === 0 && keys.length > 0) {
    next = { ...obj };
    delete next[rng.pick(keys)];
  } else if (mode === 1) next = { ...obj, extra: 'x' };
  else if (mode === 2) next = { ...obj, [rng.pick(['constructor', 'prototype', 'toString'])]: 1 };
  else {
    next = {};
    for (const k of keys) next[k] = obj[rng.pick(keys)];
  }
  return setAt(input, path, next);
}
