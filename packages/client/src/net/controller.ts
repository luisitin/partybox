// The phone's single source of truth: one socket, one store. Handles join/resume by token,
// `rev` gating, clock offset, toasts, errors and kicks (docs/PROTOCOL.md).
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type {
  ControllerView,
  ErrorPayload,
  KickedPayload,
  PushedView,
  RoomPush,
  RoomSnapshot,
  ToastPayload,
  ViewPush,
  VipAction,
  WelcomePayload,
} from '@partybox/shared';
import { createStore, nextToastId } from './store';
import type { Store, Toast } from './store';

export type Connection = 'connecting' | 'connected' | 'reconnecting';

export interface ControllerState {
  connection: Connection;
  /** True once a welcome arrived for this session. */
  joined: boolean;
  /** Auto-resume in progress (token from localStorage). */
  resuming: boolean;
  playerId: string | null;
  room: RoomSnapshot | null;
  view: PushedView<ControllerView> | null;
  rev: number;
  offsetMs: number;
  error: ErrorPayload | null;
  toasts: Toast[];
  kicked: string | null;
}

const SESSION_KEY = 'partybox:session';

interface Session {
  token: string;
  name: string;
  avatarId: string;
  roomCode?: string;
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: reconnect just won't survive a reload */
  }
}

export interface Controller {
  store: Store<ControllerState>;
  join(input: { name: string; avatarId: string; roomCode?: string }): void;
  sendInput(input: unknown): void;
  vip(action: VipAction): void;
  leave(): void;
  dismissError(): void;
  dismissToast(id: number): void;
  session(): Session | null;
}

export function createController(url?: string): Controller {
  const store = createStore<ControllerState>({
    connection: 'connecting',
    joined: false,
    resuming: loadSession() !== null,
    playerId: null,
    room: null,
    view: null,
    rev: -1,
    offsetMs: 0,
    error: null,
    toasts: [],
    kicked: null,
  });
  const socket: Socket = io(url ?? '/', { transports: ['websocket', 'polling'] });
  let seq = 0;
  let pending: Session | null = null;

  const accept = (rev: number, code: string): boolean => {
    const s = store.get();
    if (s.room && s.room.code !== code) return true;
    return rev > s.rev;
  };

  const measure = (at: number): void => {
    // Trust the newest sample; pushes are frequent enough that a moving average buys little.
    store.set({ offsetMs: at - Date.now() });
  };

  const sendJoin = (session: Session, token?: string): void => {
    socket.emit('join', {
      name: session.name,
      avatarId: session.avatarId,
      roomCode: session.roomCode,
      token,
    });
  };

  socket.on('connect', () => {
    const wasJoined = store.get().joined;
    store.set({ connection: 'connected' });
    const session = loadSession();
    if (session) {
      store.set({ resuming: !wasJoined });
      sendJoin(session, session.token);
    }
  });
  socket.on('disconnect', (reason) => {
    store.set({ connection: store.get().joined ? 'reconnecting' : 'connecting' });
    // A kick closes the socket from the server side; socket.io treats that as final, but the
    // person still needs a live connection to join again (or another room) without reloading.
    if (reason === 'io server disconnect') socket.connect();
  });
  socket.on('welcome', (payload: WelcomePayload) => {
    const session = pending ?? loadSession();
    if (session) saveSession({ ...session, token: payload.token, roomCode: payload.room.code });
    pending = null;
    measure(payload.at);
    store.set({
      joined: true,
      resuming: false,
      playerId: payload.playerId,
      room: payload.room,
      rev: -1,
      view: null,
      error: null,
      kicked: null,
    });
  });
  socket.on('room', (push: RoomPush) => {
    if (!accept(push.rev, push.room.code)) return;
    measure(push.at);
    store.set((prev) => ({
      rev: push.rev,
      room: push.room,
      view: push.room.status === 'playing' ? prev.view : null,
    }));
  });
  socket.on('view', (push: ViewPush<PushedView<ControllerView>>) => {
    const s = store.get();
    if (push.rev < s.rev) return;
    measure(push.at);
    store.set({ rev: push.rev, view: push.view });
  });
  socket.on('toast', (toast: ToastPayload) => {
    // "<name> joined" is TV information; on a phone it only piles up over the primary button.
    if (/joined/.test(toast.text)) return;
    const id = nextToastId();
    store.set(() => ({ toasts: [{ id, ...toast }] }));
    setTimeout(
      () => store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
      2500,
    );
  });
  socket.on('error', (error: ErrorPayload) => {
    if (store.get().resuming) {
      // The stored session is stale (server restarted, room gone): show the join form instead.
      saveSession(null);
      store.set({ resuming: false, error: null });
      return;
    }
    if (error.code === 'rate_limited') return;
    store.set({ error });
  });
  socket.on('kicked', (payload: KickedPayload) => {
    saveSession(null);
    store.set({ joined: false, playerId: null, room: null, view: null, kicked: payload.reason });
  });

  return {
    store,
    join(input) {
      const session: Session = {
        token: '',
        name: input.name,
        avatarId: input.avatarId,
        roomCode: input.roomCode,
      };
      pending = session;
      store.set({ error: null, kicked: null });
      sendJoin(session);
    },
    sendInput(input) {
      seq += 1;
      socket.emit('input', { seq, input });
    },
    vip(action) {
      socket.emit('vip', action);
    },
    leave() {
      socket.emit('leave', {});
      saveSession(null);
      store.set({ joined: false, playerId: null, room: null, view: null, rev: -1 });
    },
    dismissError: () => store.set({ error: null }),
    dismissToast: (id) => store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
    session: loadSession,
  };
}
