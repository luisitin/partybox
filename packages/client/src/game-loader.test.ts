// Part 00 §2.3: a game's download retries after 1, 3 and 6 s, asks whether the host restarted,
// then waits for a tap; two screens asking at once share one download.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./net/stale', () => ({ reloadIfRestarted: vi.fn(async () => false) }));

import type { GameLoaders, GamePhoneModule } from '@partybox/game-sdk';
import { loadGame, peekGame, resetGameLoaderForTests, setRetryWaitForTests } from './game-loader';
import { reloadIfRestarted } from './net/stale';

const phone = { id: 'g', Controller: () => null } as unknown as GamePhoneModule;
const waits: number[] = [];

beforeEach(() => {
  resetGameLoaderForTests();
  waits.length = 0;
  setRetryWaitForTests(async (ms) => {
    waits.push(ms);
  });
  vi.mocked(reloadIfRestarted).mockClear();
});
afterEach(() => resetGameLoaderForTests());

const loaders = (phoneLoad: () => Promise<GamePhoneModule>): Record<string, GameLoaders> => ({
  g: { phone: phoneLoad, tv: () => Promise.reject(new Error('no tv')) },
});

describe('game loader', () => {
  it('downloads once, however many screens ask', async () => {
    const load = vi.fn(async () => phone);
    const [a, b] = await Promise.all([
      loadGame('g', 'phone', loaders(load)),
      loadGame('g', 'phone', loaders(load)),
    ]);
    expect(a).toBe(phone);
    expect(b).toBe(phone);
    expect(load).toHaveBeenCalledTimes(1);
    expect(peekGame('g', 'phone')).toBe(phone);
  });

  it('retries after 1, 3 and 6 s and succeeds on a later try', async () => {
    let calls = 0;
    const load = vi.fn(async () => {
      calls += 1;
      if (calls < 3) throw new Error('offline');
      return phone;
    });
    expect(await loadGame('g', 'phone', loaders(load))).toBe(phone);
    expect(waits).toEqual([1000, 3000]);
    expect(reloadIfRestarted).not.toHaveBeenCalled();
  });

  it('gives up after four tries, checks for a restarted host; asking again starts over', async () => {
    const load = vi.fn(async (): Promise<GamePhoneModule> => {
      throw new Error('offline');
    });
    expect(await loadGame('g', 'phone', loaders(load))).toBeNull();
    expect(load).toHaveBeenCalledTimes(4);
    expect(waits).toEqual([1000, 3000, 6000]);
    expect(reloadIfRestarted).toHaveBeenCalledTimes(1);
    // The screen shows the tap-to-retry card (useGame never re-asks by itself); the tap asks
    // again, and a new ask starts the whole round over.
    expect(await loadGame('g', 'phone', loaders(load))).toBeNull();
    expect(load).toHaveBeenCalledTimes(8);
  });

  it('knows nothing of an unknown game or a surface the game does not have', async () => {
    expect(
      await loadGame(
        'nope',
        'phone',
        loaders(async () => phone),
      ),
    ).toBeNull();
    expect(
      await loadGame(
        'g',
        'settings',
        loaders(async () => phone),
      ),
    ).toBeNull();
  });
});
