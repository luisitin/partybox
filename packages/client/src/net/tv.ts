// The TV's store: an observer that renders pushes (room snapshots, views, toasts) — plus the host
// controls (ADR-031): `act` runs a VIP action as the room's VIP, `bot` adds/removes house bots.
import type {
  BotAction,
  ErrorPayload,
  PushedView,
  RoomPush,
  RoomSnapshot,
  ToastPayload,
  TvView,
  ViewPush,
  VipAction,
} from '@partybox/shared';
import { createRestartWatch } from './stale';
import { createStore, nextToastId } from './store';
import type { Store, Toast } from './store';
import { openSocket } from './socket';

export interface TvState {
  connected: boolean;
  room: RoomSnapshot | null;
  view: PushedView<TvView> | null;
  rev: number;
  offsetMs: number;
  toasts: Toast[];
  /** Home pressed mid-game: the results status it passes through is not a celebration. */
  homing: boolean;
}

/** Outcome of the stage's Home button: `off` = the server runs without `--dev-api`. */
export type HomeResult = 'ok' | 'off' | 'error';

export interface TvClient {
  store: Store<TvState>;
  /** Host control (ADR-031): any VIP action, applied with the engine's host flag. */
  act(action: VipAction): void;
  bot(action: BotAction): void;
  /**
   * TvFrame's 🏠. With a game running or over: end it and go back to the lobby, everyone stays.
   * Already in the lobby: start the party over (a fresh house room via the dev API; everyone rejoins).
   */
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
    homing: false,
  });
  const socket = openSocket(url);

  const accept = (rev: number, code: string): boolean => {
    const s = store.get();
    return (s.room !== null && s.room.code !== code) || rev > s.rev;
  };

  const restarts = createRestartWatch();
  socket.on('connect', () => {
    store.set({ connected: true });
    socket.emit('tv:join', { roomCode });
    restarts.onConnect();
  });
  socket.on('disconnect', () => store.set({ connected: false }));
  socket.on('room', (push: RoomPush) => {
    if (!accept(push.rev, push.room.code)) return;
    store.set((prev) => ({
      rev: push.rev,
      room: push.room,
      offsetMs: push.at - Date.now(),
      view: push.room.status === 'playing' ? prev.view : null,
      homing: prev.homing && push.room.status !== 'lobby',
    }));
  });
  socket.on('view', (push: ViewPush<PushedView<TvView>>) => {
    if (push.rev < store.get().rev) return;
    store.set({ rev: push.rev, view: push.view, offsetMs: push.at - Date.now() });
  });
  const showToast = (toast: ToastPayload): void => {
    const id = nextToastId();
    store.set((prev) => ({ toasts: [...prev.toasts.slice(-1), { id, ...toast }] }));
    setTimeout(
      () => store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
      3000,
    );
  };
  socket.on('toast', (toast: ToastPayload) => {
    // The chips already show who joined — in the lobby the new chip pops in, during play the
    // strip has it — so a join toast would only pull the eye to the wrong corner. Left / kicked /
    // "is now the VIP" / "The game was ended." still show. (Payloads carry no category yet, so
    // this matches the engine's "<name> joined…" text.)
    const status = store.get().room?.status;
    if ((status === 'lobby' || status === 'playing') && /\bjoined\b/.test(toast.text)) return;
    showToast(toast);
  });
  // Refusals of host actions (a game that cannot start, nobody in the room) come back as errors.
  socket.on('error', (error: ErrorPayload) => showToast({ kind: 'warning', text: error.message }));

  const act = (action: VipAction): void => {
    socket.emit('tv:vip', action);
  };

  // Home from a game: the host channel (ADR-031) ends it and returns to the lobby with everyone
  // still in. Home from the lobby: start over through the dev API's reset (start-partybox.bat runs
  // `pnpm start --dev-api`) — the server drops every player and mints a fresh house room.
  const home = async (): Promise<HomeResult> => {
    const status = store.get().room?.status;
    if (status && status !== 'lobby') {
      if (status === 'playing') {
        store.set({ homing: true });
        act({ action: 'end' });
      }
      act({ action: 'toLobby' });
      return 'ok';
    }
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

  return { store, act, bot: (action) => socket.emit('tv:bot', action), home };
}
