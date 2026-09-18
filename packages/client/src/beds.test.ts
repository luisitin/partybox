// Music beds (ADR-032): every bed schedules a bar without throwing on a stub Web Audio context,
// and the shell's bed choice follows the room state.
import { describe, expect, it } from 'vitest';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { BED_IDS, BEDS } from './beds-library';
import { bedFor } from './beds';

/** Counts what a bar schedules; every node method chains like the real API. */
function stubContext(): { ctx: AudioContext; started: number } {
  const stats = { started: 0 };
  const param = () => ({
    value: 0,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
    setTargetAtTime() {},
    cancelScheduledValues() {},
  });
  const node = () => {
    const n = {
      connect: (to: unknown) => to,
      disconnect() {},
      start() {
        stats.started += 1;
      },
      stop() {},
      gain: param(),
      frequency: param(),
      detune: param(),
      type: 'sine',
      buffer: null,
    };
    return n;
  };
  const ctx = {
    currentTime: 10,
    sampleRate: 48_000,
    createOscillator: node,
    createGain: node,
    createBufferSource: node,
    createBiquadFilter: node,
    createBuffer: (_c: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    }),
    destination: {},
  } as unknown as AudioContext;
  return {
    ctx,
    get started() {
      return stats.started;
    },
  };
}

describe('bed library', () => {
  for (const id of BED_IDS) {
    it(`${id} schedules notes for four consecutive bars`, () => {
      const stub = stubContext();
      const out = stub.ctx.createGain();
      const bed = BEDS[id];
      expect(bed.bpm).toBeGreaterThan(40);
      expect(bed.level).toBeGreaterThan(0);
      expect(bed.level).toBeLessThanOrEqual(0.3);
      for (let bar = 0; bar < 4; bar += 1) bed.bar(stub.ctx, out, 10 + bar * 2, bar);
      expect(stub.started).toBeGreaterThan(8);
    });
  }
});

describe('bedFor', () => {
  const view = (phaseId: string): PushedView<TvView> =>
    ({
      gameId: 'blanks',
      phaseId,
      deadline: null,
      paused: false,
      players: [],
    }) as unknown as PushedView<TvView>;
  const room = (status: RoomSnapshot['status']): RoomSnapshot =>
    ({ status, selectedGameId: 'blanks', players: [], code: 'ABCD' }) as unknown as RoomSnapshot;
  const beds = { intro: 'warm', judge: 'marimba', bogus: 'not-a-bed' };

  it('maps the phase to its bed while playing, nothing otherwise', () => {
    expect(bedFor(room('playing'), view('intro'), beds)).toBe('warm');
    expect(bedFor(room('playing'), view('judge'), beds)).toBe('marimba');
    expect(bedFor(room('playing'), view('answer'), beds)).toBeNull();
    expect(bedFor(room('playing'), view('bogus'), beds)).toBeNull();
    expect(bedFor(room('results'), view('intro'), beds)).toBeNull();
    expect(bedFor(room('lobby'), null, beds)).toBeNull();
    // A phase that names several beds takes the next one each time it begins (loop #197).
    const rota = { judge: ['marimba', 'lofi'] };
    expect(bedFor(room('playing'), view('judge'), rota, {})).toBe('marimba');
    expect(bedFor(room('playing'), view('judge'), rota, { judge: 1 })).toBe('lofi');
    expect(bedFor(room('playing'), view('judge'), rota, { judge: 2 })).toBe('marimba');
    expect(bedFor(room('playing'), view('judge'), { judge: [] }, {})).toBeNull();
    expect(bedFor(room('playing'), view('intro'), undefined)).toBeNull();
    expect(bedFor(null, view('intro'), beds)).toBeNull();
  });
});
