// Hidden information (SPEC §9.12): the key only in spymaster views, identities on phones only at
// stage 2, spectators get the TV view, and — the non-interference check — nothing a guesser, the
// other team, the TV or a spectator sees differs by what a face-down card is.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { allPoint, clue, rigged, send, tick } from './kit';
import type { Kind, State } from '../server/types';

const VIEWERS = ['p2', 'p3', 'p5', 'p6', 'late-joiner'];

/** Re-deal every face-down identity (keeping the counts) — what a viewer must not be able to tell. */
function reroll(s: State): State {
  const down = s.key.map((_, i) => i).filter((i) => s.flipped[i] === 0);
  const kinds = down.map((i) => s.key[i] as Kind).reverse();
  const key = [...s.key];
  down.forEach((i, j) => (key[i] = kinds[j] as Kind));
  return { ...s, key };
}

function sameViews(s: State): void {
  const other = reroll(s);
  for (const id of VIEWERS)
    expect(JSON.stringify(game.controllerView(other, id)), id).toBe(
      JSON.stringify(game.controllerView(s, id)),
    );
}

describe('the key', () => {
  it('reaches both spymasters and nobody else', () => {
    const s = rigged();
    expect(game.controllerView(s, 'p1').key).toEqual(s.key);
    expect(game.controllerView(s, 'p4').key).toEqual(s.key);
    for (const id of VIEWERS) expect(game.controllerView(s, id).key).toBeNull();
    expect('key' in game.tvView(s)).toBe(false);
  });

  it('spectators get exactly the TV view', () => {
    const s = clue(rigged(), 2);
    const spectator = game.controllerView(s, 'late-joiner');
    const {
      me: _me,
      role: _r,
      team: _t,
      myPointer: _p,
      key,
      roots: _roots,
      clueError: _e,
      ...rest
    } = spectator;
    expect(key).toBeNull();
    expect(JSON.stringify(rest)).toBe(JSON.stringify(game.tvView(s)));
  });
});

describe('two-stage flip', () => {
  it('the TV learns the card at stage 1, phones at stage 2', () => {
    let s = allPoint(clue(rigged(), 2), 17);
    expect(s.phase.id).toBe('flip');
    expect(game.tvView(s).kinds[17]).toBe('bystander');
    for (const id of VIEWERS.slice(0, 4))
      expect(game.controllerView(s, id).kinds[17], id).toBeNull();
    expect(game.controllerView(s, 'late-joiner').kinds[17]).toBe('bystander'); // spectators = the TV
    s = tick(s);
    for (const id of VIEWERS.slice(0, 4))
      expect(game.controllerView(s, id).kinds[17]).toBe('bystander');
  });
});

describe('non-interference', () => {
  it('views do not depend on face-down identities, in every phase', () => {
    let s = rigged();
    sameViews(s);
    s = clue(s, 2);
    sameViews(s);
    s = send(s, 'p2', { type: 'point', target: 5 });
    sameViews(s);
    s = send(s, 'p3', { type: 'point', target: 5 });
    expect(s.phase.id).toBe('flip');
    // Stage 1: the flipping card is still secret on phones — reroll the others AND that one.
    sameViews(s);
  });
});
