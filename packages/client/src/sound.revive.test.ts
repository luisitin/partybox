// The owner (2026-09-22): "in phone only mode I don't hear the caller". iOS parks the
// AudioContext whenever the phone locks, backgrounds or takes a call, and nothing revived it
// after the join gesture — so a phone that had sound simply went quiet mid-game.
import { beforeEach, describe, expect, it, vi } from 'vitest';

class FakeCtx {
  state = 'suspended';
  currentTime = 0;
  destination = {};
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  createGain = (): unknown => ({
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(() => ({ connect: vi.fn() })),
  });
  createBufferSource = (): unknown => ({
    connect: vi.fn(() => ({ connect: vi.fn() })),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
  });
}

/** A document with just what the engine listens on. */
function fakeDocument(): { fire: (type: string) => void; visibilityState: string } {
  const handlers = new Map<string, (() => void)[]>();
  const doc = {
    visibilityState: 'visible',
    addEventListener: (type: string, fn: () => void) => {
      handlers.set(type, [...(handlers.get(type) ?? []), fn]);
    },
    fire: (type: string) => {
      for (const fn of handlers.get(type) ?? []) fn();
    },
  };
  vi.stubGlobal('document', doc);
  return doc as unknown as { fire: (type: string) => void; visibilityState: string };
}

describe('the phone revives a parked AudioContext', () => {
  let ctx: FakeCtx;
  beforeEach(() => {
    vi.resetModules();
    ctx = new FakeCtx();
    vi.stubGlobal('window', {
      AudioContext: function () {
        return ctx;
      },
    } as unknown as Window & typeof globalThis);
    vi.stubGlobal('AudioContext', function () {
      return ctx;
    } as unknown as typeof AudioContext);
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, statusText: 'nope' })),
    );
  });

  it('resumes when the page becomes visible again (an iPhone coming back)', async () => {
    const doc = fakeDocument();
    const { createSoundEngine } = await import('./sound');
    const engine = createSoundEngine({});
    await engine.enable();
    ctx.state = 'interrupted'; // what iOS reports after a lock or a call
    ctx.resume.mockClear();
    doc.fire('visibilitychange');
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('resumes on a tap, and only once per burst', async () => {
    const doc = fakeDocument();
    const { createSoundEngine } = await import('./sound');
    const engine = createSoundEngine({});
    await engine.enable();
    ctx.state = 'suspended';
    ctx.resume.mockClear();
    doc.fire('pointerdown');
    doc.fire('pointerdown');
    doc.fire('pointerdown');
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('a call whose clip will not decode still speaks, through an <audio> element', async () => {
    fakeDocument();
    const played: string[] = [];
    class FakeAudio {
      volume = 1;
      currentTime = 0;
      constructor(public src: string) {}
      addEventListener = (): void => undefined;
      pause = (): void => undefined;
      play = async (): Promise<void> => {
        played.push(this.src);
      };
    }
    vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
    const { createSoundEngine } = await import('./sound');
    const engine = createSoundEngine({});
    await engine.enable();
    engine.clip('/sfx/calls/b12.wav');
    await new Promise((r) => setTimeout(r, 20));
    expect(played).toEqual(['/sfx/calls/b12.wav']);
  });

  it('tells listeners when the phone is muted, so its music and beds follow (2026-09-22)', async () => {
    fakeDocument();
    const { createSoundEngine } = await import('./sound');
    const engine = createSoundEngine({});
    const heard: boolean[] = [];
    const stop = engine.onMuteChange((m) => heard.push(m));
    engine.setMuted(true);
    engine.setMuted(false);
    stop();
    engine.setMuted(true); // after unsubscribing: not heard
    expect(heard).toEqual([true, false]);
    expect(engine.muted()).toBe(true);
  });
});
