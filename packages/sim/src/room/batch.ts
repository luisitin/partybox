// Many room-chaos runs + summary + repro files (`reports/stress/repros/room-<hash>.json`).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EngineDeps, RoomEvent } from '@partybox/engine';
import { applyRoomEvent, createRoom } from '@partybox/engine';
import type { AnyGameDefinition } from '@partybox/shared';
import { T0, fnv1a, hashState } from '@partybox/game-sdk/testing';
import { REPRO_DIR } from '../repro';
import { runRoomChaos } from './chaos';
import type { RoomViolation } from './chaos';
import { checkRoom } from './invariants';

export interface RoomReproFile {
  version: 'room-1';
  seed: number;
  steps: number;
  gameIds: string[];
  events: RoomEvent[];
  violations: RoomViolation[];
  finalHash: string;
}

export interface RoomBatchSummary {
  runs: number;
  failed: number;
  gamesStarted: number;
  gamesFinished: number;
  events: number;
  byDetail: Record<string, number>;
  first: { seed: number; detail: string }[];
  repros: string[];
  notes: string[];
  ms: number;
}

export function runRoomBatch(options: {
  games: Record<string, AnyGameDefinition>;
  runs: number;
  seed: number;
  steps: number;
  writeRepros: boolean;
  reproDir?: string;
}): RoomBatchSummary {
  const started = Date.now();
  const s: RoomBatchSummary = {
    runs: options.runs,
    failed: 0,
    gamesStarted: 0,
    gamesFinished: 0,
    events: 0,
    byDetail: {},
    first: [],
    repros: [],
    notes: [],
    ms: 0,
  };
  const notes = new Set<string>();
  for (let i = 0; i < options.runs; i++) {
    const run = runRoomChaos({
      seed: options.seed + i,
      steps: options.steps,
      games: options.games,
    });
    s.gamesStarted += run.gamesStarted;
    s.gamesFinished += run.gamesFinished;
    s.events += run.events.length;
    for (const n of run.notes) notes.add(n);
    if (run.violations.length === 0) continue;
    s.failed += 1;
    for (const v of run.violations) {
      const key = v.detail.replace(/u\d+|\d+ s\b/g, '#');
      s.byDetail[key] = (s.byDetail[key] ?? 0) + 1;
    }
    if (s.first.length < 5)
      s.first.push({ seed: run.seed, detail: run.violations[0]?.detail ?? '' });
    if (options.writeRepros) {
      const dir = options.reproDir ?? REPRO_DIR;
      mkdirSync(dir, { recursive: true });
      const file: RoomReproFile = {
        version: 'room-1',
        seed: run.seed,
        steps: options.steps,
        gameIds: Object.keys(options.games),
        events: run.events,
        violations: run.violations,
        finalHash: run.hash,
      };
      const path = join(dir, `room-${fnv1a(`${run.seed}:${options.steps}`)}.json`);
      writeFileSync(path, JSON.stringify(file, null, 2));
      s.repros.push(path);
    }
  }
  s.notes = [...notes];
  s.ms = Date.now() - started;
  return s;
}

export function formatRoomBatch(s: RoomBatchSummary): string {
  const lines = [
    `room-chaos: ${s.runs} runs, ${s.failed} failed, ${s.events} events, ${s.gamesStarted} games started / ${s.gamesFinished} finished, ${s.ms} ms`,
  ];
  for (const [d, n] of Object.entries(s.byDetail)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12))
    lines.push(`  ${n}× ${d}`);
  for (const f of s.first) lines.push(`  seed ${f.seed}: ${f.detail}`);
  for (const r of s.repros.slice(0, 5)) lines.push(`  repro: ${r}`);
  for (const n of s.notes) lines.push(`  note: ${n}`);
  return lines.join('\n');
}

/** Re-applies a room repro with invariants on. */
export function replayRoomRepro(
  path: string,
  games: Record<string, AnyGameDefinition>,
): { violations: RoomViolation[]; matches: boolean } {
  const file = JSON.parse(readFileSync(path, 'utf8')) as RoomReproFile;
  const deps: EngineDeps = { games };
  let room = createRoom({ code: 'ZZZZ', now: T0 });
  const violations: RoomViolation[] = [];
  file.events.forEach((event, at) => {
    const result = applyRoomEvent(room, event, deps);
    for (const detail of checkRoom(room, result, deps)) violations.push({ at, detail });
    room = result.room;
  });
  return { violations, matches: hashState(room) === file.finalHash };
}
