// The only source of `now` in the server. The dev API can freeze it so screenshots and replays are
// reproducible; while frozen, no room timer fires until `set()` moves time forward.
export interface Clock {
  now(): number;
  isFrozen(): boolean;
  freeze(at?: number): void;
  unfreeze(): void;
  /** Sets the frozen time (freezes first if needed). */
  set(now: number): void;
  /** Called after every change so the host can re-arm its timers. */
  onChange(listener: () => void): void;
}

export function createClock(): Clock {
  let frozenAt: number | null = null;
  const listeners: (() => void)[] = [];
  const changed = (): void => {
    for (const l of listeners) l();
  };
  return {
    now: () => frozenAt ?? Date.now(),
    isFrozen: () => frozenAt !== null,
    freeze(at) {
      frozenAt = at ?? Date.now();
      changed();
    },
    unfreeze() {
      frozenAt = null;
      changed();
    },
    set(now) {
      frozenAt = now;
      changed();
    },
    onChange(listener) {
      listeners.push(listener);
    },
  };
}
