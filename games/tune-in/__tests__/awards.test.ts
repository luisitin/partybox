// Spec §5.7 awards: individual in every mode, skipped when nobody earned one, ties share — up to
// MAX_SHARED_AWARD players, past which the award is skipped (a six-way tie is no honour).
import { describe, expect, it } from 'vitest';
import { awardsFor, MAX_SHARED_AWARD } from '../server/scoring';
import type { PlayerStats, State } from '../server/types';
import { start } from './helpers';

const stats = (bulls: number): PlayerStats => ({
  bulls,
  dials: 0,
  dist: 0,
  zeros: 0,
  psyTurns: 0,
  psyPts: 0,
});

function withBulls(s: State, bulls: number[]): State {
  const next: Record<string, PlayerStats> = {};
  s.seats.forEach((id, i) => (next[id] = stats(bulls[i] ?? 0)));
  return { ...s, stats: next };
}

const sharp = (s: State): string[] =>
  awardsFor(s)
    .filter((a) => a.id === 'sharpshooter')
    .map((a) => a.playerId);

describe('awards', () => {
  it('go to the one leader', () => {
    const s = withBulls(start(6), [3, 1, 1, 0, 0, 0]);
    expect(sharp(s)).toEqual([s.seats[0]]);
  });

  it('are shared by a small tie', () => {
    const s = withBulls(start(6), [2, 2, 1, 0, 0, 0]);
    expect(sharp(s)).toEqual([s.seats[0], s.seats[1]]);
  });

  it('are skipped when too many tie', () => {
    const tie = Array.from({ length: MAX_SHARED_AWARD + 1 }, () => 2);
    expect(sharp(withBulls(start(8), tie))).toEqual([]);
  });

  it('are skipped when nobody earned one', () => {
    expect(sharp(withBulls(start(4), [0, 0, 0, 0]))).toEqual([]);
  });
});
