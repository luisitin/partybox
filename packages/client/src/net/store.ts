// Minimal external store for React (`useSyncExternalStore`), no library (ADR-011).
import { useSyncExternalStore } from 'react';

export interface Store<T> {
  get(): T;
  set(patch: Partial<T> | ((prev: T) => Partial<T>)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      for (const l of listeners) l();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T extends object, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get()),
  );
}

export interface Toast {
  id: number;
  kind: 'info' | 'success' | 'warning';
  text: string;
  /** I-040 B: the player the toast is about (the lobby rings their chip). */
  playerId?: string;
}

let toastSeq = 0;
export function nextToastId(): number {
  toastSeq += 1;
  return toastSeq;
}

/** How long a toast stays: long enough for a slow reader to finish it ([cc45f4]); a longer line
 *  (and its longer Spanish) gets more, never past 6 s. */
export function toastMs(text: string): number {
  return Math.min(6000, Math.max(2500, 1200 + 70 * [...text].length));
}

/** One toast at a time on a phone (a new one replaces the last), gone after toastMs. */
export function toastOnce(store: Store<{ toasts: Toast[] }>, shown: Omit<Toast, 'id'>): void {
  const id = nextToastId();
  store.set(() => ({ toasts: [{ id, ...shown }] }));
  setTimeout(
    () => store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
    toastMs(shown.text),
  );
}
