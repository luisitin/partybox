// A game's code, fetched when the room needs it (Part 00 §2.3, ADR-050): the phone entry once the
// game is chosen (or on a late join / reload mid-game), the TV entry on the TV, the 🎨 panel when a
// player opens it. One promise per game and surface; a failed download retries after 1, 3 and 6 s,
// then asks whether the host restarted (a stale page reloads) and otherwise waits for a tap
// ("Couldn't load the game. Tap to retry."). The engine never waits for a download: views arrive
// in full, so a phone that loads late renders the present.
import { useEffect, useSyncExternalStore } from 'react';
import type { GamePhoneModule, GameSettingsModule, GameTvModule } from '@partybox/game-sdk';
import { gameLoaders } from './games.generated';
import { reloadIfRestarted } from './net/stale';

export type Surface = 'phone' | 'tv' | 'settings';
export type ModuleOf<S extends Surface> = S extends 'phone'
  ? GamePhoneModule
  : S extends 'tv'
    ? GameTvModule
    : GameSettingsModule;

type Slot = { state: 'loading' } | { state: 'ready'; module: unknown } | { state: 'failed' };

/** The waits between attempts: 1 s, 3 s, 6 s, then the tap-to-retry card. */
export const RETRY_MS: readonly number[] = [1000, 3000, 6000];

const slots = new Map<string, Slot>();
const listeners = new Set<() => void>();
const notify = (): void => {
  for (const l of listeners) l();
};
const subscribe = (l: () => void): (() => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
let wait = (ms: number): Promise<void> => new Promise((ok) => setTimeout(ok, ms));

/** Tests: make the retry waits instant (or observable). */
export function setRetryWaitForTests(fn: (ms: number) => Promise<void>): void {
  wait = fn;
}
/** Tests: forget every download. */
export function resetGameLoaderForTests(): void {
  slots.clear();
  notify();
}

const keyOf = (id: string, surface: Surface): string => `${id}:${surface}`;

/** Starts (or joins) the download of one game surface; null for an unknown game or surface. */
export async function loadGame<S extends Surface>(
  id: string,
  surface: S,
  loaders: typeof gameLoaders = gameLoaders,
): Promise<ModuleOf<S> | null> {
  const load = loaders[id]?.[surface];
  if (!load) return null;
  const key = keyOf(id, surface);
  const have = slots.get(key);
  if (have?.state === 'ready') return have.module as ModuleOf<S>;
  if (have?.state === 'loading') return waitFor(key) as Promise<ModuleOf<S> | null>;
  slots.set(key, { state: 'loading' });
  notify();
  let attemptLoad: () => Promise<unknown> = load;
  for (let attempt = 0; ; attempt += 1) {
    try {
      const module = await attemptLoad();
      slots.set(key, { state: 'ready', module });
      notify();
      return module as ModuleOf<S>;
    } catch (err) {
      const pause = RETRY_MS[attempt];
      if (pause === undefined) {
        console.warn(`[partybox] could not load ${key}`, err);
        break;
      }
      // A browser keeps a failed module import and hands the same failure back (Chrome did in
      // the F1 probe: one request, three silent retries): ask for that file again under a new URL.
      const url = failedModuleUrl(err);
      if (url) attemptLoad = () => importFresh(url, attempt + 1, surface);
      console.info(
        `[partybox] ${key} did not load; trying again in ${pause} ms`,
        url ?? String(err),
      );
      await wait(pause);
    }
  }
  // A page from an older build asks for chunks the host no longer has: reload once. Otherwise the
  // connection is at fault — the player taps to try again.
  await reloadIfRestarted(`the ${id} download is gone (new build?)`);
  slots.set(key, { state: 'failed' });
  notify();
  return null;
}

/** The chunk a failed dynamic import named (Chrome, Firefox; Safari names none). */
export function failedModuleUrl(err: unknown): string | null {
  const m = /(https?:\/\/\S+?\.js)\b/.exec(err instanceof Error ? err.message : String(err));
  return m?.[1] ?? null;
}

async function importFresh(url: string, attempt: number, surface: Surface): Promise<unknown> {
  const mod = (await import(/* @vite-ignore */ `${url}?retry=${attempt}`)) as Record<
    string,
    unknown
  >;
  if (!(surface in mod)) throw new Error(`${url} has no ${surface}`);
  return mod[surface];
}

function waitFor(key: string): Promise<unknown> {
  return new Promise((resolve) => {
    const check = (): void => {
      const s = slots.get(key);
      if (s?.state === 'loading') return;
      listeners.delete(check);
      resolve(s?.state === 'ready' ? s.module : null);
    };
    listeners.add(check);
  });
}

/** The module if it has already arrived (the shell's synchronous reads: sounds, strings). */
export function peekGame<S extends Surface>(
  id: string | null | undefined,
  surface: S,
): ModuleOf<S> | undefined {
  const s = id ? slots.get(keyOf(id, surface)) : undefined;
  return s?.state === 'ready' ? (s.module as ModuleOf<S>) : undefined;
}

export interface GameHandle<S extends Surface> {
  module: ModuleOf<S> | null;
  failed: boolean;
  /** After a failure (the tap-to-retry card): reload the page. A reload is the one retry every
   *  browser honours — Safari keeps a failed import and names no URL — and the phone's stored
   *  session takes its seat straight back. */
  retry: () => void;
}

/** A game surface for a screen: downloads it when `id` is set, re-renders when it arrives. */
export function useGame<S extends Surface>(
  id: string | null | undefined,
  surface: S,
): GameHandle<S> {
  const key = id ? keyOf(id, surface) : '';
  const get = (): Slot | undefined => (key ? slots.get(key) : undefined);
  const slot = useSyncExternalStore(subscribe, get, get);
  useEffect(() => {
    if (id && !slots.has(keyOf(id, surface))) void loadGame(id, surface);
  }, [id, surface]);
  return {
    module: slot?.state === 'ready' ? (slot.module as ModuleOf<S>) : null,
    failed: slot?.state === 'failed',
    retry: () => location.reload(),
  };
}
