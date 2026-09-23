// I-113 A: "Previous number" off hides it on the TV — and now on every phone too.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { start, timer } from './helpers';

/** A few calls into round 1, so there is a previous number to show or hide. */
function threeCallsIn(showPrevious: boolean) {
  let s = timer(start({ showPrevious })); // intro → play (call 1)
  s = timer(s); // call 2
  s = timer(s); // call 3
  return s;
}

describe('the previous number (I-113 A)', () => {
  it('rides to the phones when the setting is on', () => {
    const s = threeCallsIn(true);
    expect(s.phase.id).toBe('play');
    const phone = game.controllerView(s, 'a');
    expect(phone.previous).not.toBeNull();
    expect(phone.previous).toEqual(game.tvView(s).previous);
  });

  it('is gone from every phone when it is off, as it is from the TV', () => {
    const s = threeCallsIn(false);
    expect(game.controllerView(s, 'a').previous).toBeNull();
    expect(game.controllerView(s, 'b').previous).toBeNull();
    expect(game.tvView(s).showPrevious).toBe(false);
    // the current call is untouched
    expect(game.controllerView(s, 'a').current).toEqual(game.tvView(s).current);
  });
});
