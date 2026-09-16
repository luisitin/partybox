// The TV's store: a pure observer. Joins the house room (or ?room=CODE), applies pushes in rev
// order, tracks the clock offset, and buffers toasts.
import { io } from 'socket.io-client';
import type {
  PushedView,
  RoomPush,
  RoomSnapshot,
  ToastPayload,
  TvView,
  ViewPush,
} from '@partybox/shared';
import { createStore, nextToastId } from './store';
import type { Store, Toast } from './store';

export interface TvState {
  connected: boolean;
  room: RoomSnapshot | null;
  view: PushedView<TvView> | null;
  rev: number;
  offsetMs: number;
  toasts: Toast[];
}

/** Outcome of the stage's Home button: `off` = the server runs without `--dev-api`. */
export type HomeResult = 'ok' | 'off' | 'error';

export interface TvClient {
  store: Store<TvState>;
  /** Start over: a fresh house room, everyone rejoins (TvFrame's 🏠). */
  home(): Promise<HomeResult>;
}

export function createTvClient(roomCode?: string, url?: string): TvClient {
  const store = createStore<TvState>({
    connected: false,
    room: null,
    view: null,
    rev: -1,
    offsetMs: 0,
    toasts: [],
  });
  const socket = io(url ?? '/', { transports: ['websocket', 'polling'] });

  const accept = (rev: number, code: string): boolean => {
    const s = store.get();
    return (s.room !== null && s.room.code !== code) || rev > s.rev;
  };

  socket.on('connect', () => {
    store.set({ connected: true });
    socket.emit('tv:join', { roomCode });
  });
  socket.on('disconnect', () => store.set({ connected: false }));
  socket.on('room', (push: RoomPush) => {
    if (!accept(push.rev, push.room.code)) return;
    store.set((prev) => ({
      rev: push.rev,
      room: push.room,
      offsetMs: push.at - Date.now(),
      view: push.room.status === 'playing' ? prev.view : null,
    }));
  });
  socket.on('view', (push: ViewPush<PushedView<TvView>>) => {
    if (push.rev < store.get().rev) return;
    store.set({ rev: push.rev, view: push.view, offsetMs: push.at - Date.now() });
  });
  socket.on('toast', (toast: ToastPayload) => {
    // During play the chips already show who joined; a join toast would only cover the stage.
    // (Payloads carry no category yet, so this matches the engine's "<name> joined…" text.)
    if (store.get().room?.status === 'playing' && /\bjoined\b/.test(toast.text)) return;
    const id = nextToastId();
    store.set((prev) => ({ toasts: [...prev.toasts.slice(-1), { id, ...toast }] }));
    setTimeout(
      () => store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
      3000,
    );
  });

  // The TV is a pure observer with no authority of its own (docs/PROTOCOL.md), so Home goes
  // through the dev API's reset (start-partybox.bat runs `pnpm start --dev-api`): the server drops
  // every player and mints a fresh house room; re-joining picks up the new code.
  const home = async (): Promise<HomeResult> => {
    try {
      const res = await fetch(`${url ?? ''}/api/dev/reset`, { method: 'POST' });
      if (res.status === 403) return 'off';
      if (!res.ok) return 'error';
      store.set({ toasts: [] });
      socket.emit('tv:join', { roomCode });
      return 'ok';
    } catch {
      return 'error';
    }
  };

  return { store, home };
}
