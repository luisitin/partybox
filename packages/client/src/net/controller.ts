// The phone's single source of truth: one socket, one store. Handles join/resume by token,
// `rev` gating, clock offset, toasts, errors and kicks (docs/PROTOCOL.md).
import type { Socket } from 'socket.io-client';
import type {
  ControllerView,
  ErrorPayload,
  KickedPayload,
  PushedView,
  RoomPush,
  ToastPayload,
  ViewPush,
  WelcomePayload,
} from '@partybox/shared';
import { getLang, subscribeLang } from '@partybox/game-sdk/ui';
import { createLinkWatch } from './link-watch';
import { dropRoomFromUrl } from './leave-url';
import { storeCanSeeTv, storedCanSeeTv } from '../presence';
import { createRestartWatch } from './stale';
import { createSeatChannel } from './seat-channel';
import { loadIdentity, loadSession, saveIdentity, saveSession } from './session-store';
import type { Session } from './session-store';
import { createStore, toastOnce } from './store';
import { followHouseRoom, replaceRoomParam } from './room-param';
import { openSocket } from './socket';
import type { Controller, ControllerState } from './controller-types';

export type { Connection, Controller, ControllerState } from './controller-types';
export type { Identity } from './session-store';

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
    restarted: false,
    otherTab: false,
  });
  const socket: Socket = openSocket(url);
  let seq = 0;
  let pending: Session | null = null;

  const accept = (rev: number, code: string): boolean => {
    const s = store.get();
    if (s.room && s.room.code !== code) return true;
    return rev > s.rev;
  };

  let lastPushAt = Date.now();
  const measure = (at: number): void => {
    // Trust the newest sample; pushes are frequent enough that a moving average buys little.
    store.set({ offsetMs: at - Date.now() });
    lastPushAt = Date.now();
    // Any push proves the link: a stale-watchdog 'reconnecting' (below) ends here.
    if (socket.connected) backOnline();
  };

  const link = createLinkWatch();
  const goStale = (): void => {
    const s = store.get();
    if (!link.shouldGoStale(s.joined, s.connection === 'reconnecting')) return;
    store.set({ connection: 'reconnecting' });
    socket.io.engine?.close();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
      if (!store.get().joined) return;
      link.onOffline();
      store.set({ connection: 'reconnecting' });
      socket.io.engine?.close();
    });
    window.addEventListener('online', () => {
      if (!socket.connected) socket.connect();
    });
  }
  setInterval(() => {
    const s = store.get();
    const deadline = s.view?.deadline ?? null;
    if (s.connection !== 'connected' || !s.view || s.view.paused || deadline === null) return;
    const serverNow = Date.now() + s.offsetMs;
    if (serverNow > deadline + 2000 && lastPushAt + 2000 < Date.now()) goStale();
  }, 1000);

  const sendJoin = (session: Session, token?: string, takeOver?: boolean): void => {
    socket.emit('join', {
      name: session.name,
      avatarId: session.avatarId,
      roomCode: session.roomCode,
      token,
      ...(takeOver ? { takeOver: true } : {}),
      ...(session.photo ? { photo: session.photo } : {}),
      ...(storedCanSeeTv(session.roomCode) !== undefined
        ? { canSeeTv: storedCanSeeTv(session.roomCode) }
        : {}),
      // ADR-054: the VIP phone's language is the room's content language until someone chooses
      lang: getLang() === 'es' ? 'es' : 'en',
    });
  };

  // ADR-054: a phone that changes its language (🎨) says so; the server ignores it until seated
  // (herd-mind 07b839: the VIP's switch in the lobby must move the room's default at once).
  subscribeLang(() => socket.emit('lang', { lang: getLang() === 'es' ? 'es' : 'en' }));

  const restarts = createRestartWatch();
  // I-755 A: set when another tab holds the seat; cleared by "Play here"
  let holdReconnect = false;
  let forceHere = false;
  // I-755 B: this browser's tabs talk: "who has the seat?" / "I do" (a playing tab answers)
  const askOtherTabs = createSeatChannel(() =>
    store.get().joined && !holdReconnect ? (loadSession()?.token ?? null) : null,
  );
  socket.on('connect', () => {
    link.onConnect();
    restarts.onConnect();
    const wasJoined = store.get().joined;
    backOnline();
    store.set({ connection: 'connected' });
    const session = loadSession();
    if (session) {
      store.set({ resuming: !wasJoined });
      // I-755 B: first ask this browser's other tabs; if one is playing, this (new) tab steps aside
      (forceHere ? Promise.resolve(false) : askOtherTabs(session.token)).then((taken) => {
        forceHere = false;
        if (taken && !wasJoined) {
          holdReconnect = true;
          store.set({ otherTab: true, resuming: false });
          socket.disconnect();
          return;
        }
        sendJoin(session, session.token);
      });
    }
  });
  socket.on('disconnect', (reason) => {
    store.set({ connection: store.get().joined ? 'reconnecting' : 'connecting' });
    // A kick closes the socket from the server side; socket.io treats that as final, but the
    // person still needs a live connection to join again (or another room) without reloading.
    if (reason === 'io server disconnect' && !holdReconnect) socket.connect();
  });
  socket.on('welcome', (payload: WelcomePayload) => {
    // I-658 B: the address carries the room the phone is really in (a reload, a share)
    replaceRoomParam(payload.room.code);
    const session = pending ?? loadSession();
    if (session) {
      saveSession({ ...session, token: payload.token, roomCode: payload.room.code });
      saveIdentity({
        name: session.name,
        avatarId: session.avatarId,
        ...(session.photo ? { photo: session.photo } : {}),
      });
    }
    pending = null;
    measure(payload.at);
    store.set((prev) => ({
      joined: true,
      resuming: false,
      playerId: payload.playerId,
      room: payload.room,
      rev: -1,
      // Resuming into the same game keeps the last view until the fresh push lands a tick later:
      // the game screen stays mounted (no blank flash, and it can see what it missed — loop #4).
      view:
        prev.playerId === payload.playerId &&
        prev.room?.code === payload.room.code &&
        payload.room.status === 'playing'
          ? prev.view
          : null,
      error: null,
      kicked: null,
      restarted: false,
    }));
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
  const showToast = (shown: ToastPayload): void => toastOnce(store, shown);
  // Reconnecting → connected while in a room. The banner itself now ends with "✓ Back online"
  // (flapFree.ts), so no toast: the toast (review-loop #33, when the banner vanished silently) fired
  // on EVERY reconnect — a toast per flap on a weak link, and "Back online" while the banner was
  // still, deliberately, saying "Reconnecting…" (the owner, 2026-09-22).
  const backOnline = (): void => {
    const s = store.get();
    if (s.connection !== 'reconnecting' || !s.joined) return;
    store.set({ connection: 'connected' });
  };
  socket.on('toast', (toast: ToastPayload) => {
    // "<name> joined" is TV information; on a phone it only piles up over the primary button.
    if (/\bjoined\b/.test(toast.text)) return;
    // "<name> is now the VIP" lands on every phone; on the new VIP's own it should speak to them
    // and point at the badge that just appeared (review-loop #5). Names are unique per room.
    const s = store.get();
    const handover = /^(.+) is now the VIP$/.exec(toast.text);
    const mine = handover && s.room?.players.find((p) => p.id === s.playerId)?.name === handover[1];
    showToast(
      mine ? { kind: 'success', text: "You're the VIP now — tap ★ VIP for host controls" } : toast,
    );
  });
  socket.on('error', (error: ErrorPayload) => {
    const s = store.get();
    // A stored session the server no longer knows — resuming after a reload, or auto-rejoining
    // after a reconnect once the server restarted or the TV's Home reset the room — goes back to
    // the join form with the "started over" hint instead of an error banner over a stale screen.
    const staleSession =
      pending === null &&
      (s.resuming || (s.joined && (error.code === 'room_not_found' || error.code === 'bad_token')));
    if (staleSession) {
      saveSession(null);
      // I-744 A: the room in the QR link is gone (a restart or a reset) — drop it, so the join
      // screen asks for a room (or offers the one that is open) instead of re-sending the dead code.
      dropRoomFromUrl();
      store.set({
        joined: false,
        resuming: false,
        playerId: null,
        room: null,
        view: null,
        rev: -1,
        error: null,
        toasts: [],
        restarted: true,
      });
      // I-658 B: the form shows the new room, not the dead code in the address
      followHouseRoom(() => store.set({ restarted: true }));
      return;
    }
    if (error.code === 'rate_limited') return;
    // A tap that raced the end of a game (a daub, a vote, the VIP's Pause) reaches the server just
    // after it finished; the phone is about to show the results anyway, so "No game is running."
    // over them is noise, never news (found by the 2026-09-22 sweep on a Bingo results screen).
    if (error.code === 'not_playing') return;
    pending = null;
    store.set({ error });
  });
  socket.on('kicked', (payload: KickedPayload) => {
    // I-755 A: another tab took the seat — keep the login (the tabs share it), stop reconnecting
    if (payload.reason === 'another_tab') {
      holdReconnect = true;
      store.set({ otherTab: true });
      return;
    }
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
        ...(input.photo ? { photo: input.photo } : {}),
      };
      pending = session;
      store.set({ error: null, kicked: null });
      sendJoin(session, undefined, input.takeOver);
    },
    sendInput(input) {
      seq += 1;
      socket.emit('input', { seq, input });
    },
    vip(action) {
      socket.emit('vip', action);
    },
    bot(action) {
      socket.emit('bot', action);
    },
    nudge() {
      socket.emit('nudge', {});
    },
    ready() {
      socket.emit('ready', {});
    },
    vote(gameId) {
      socket.emit('vote', { gameId });
    },
    setCanSeeTv(on) {
      storeCanSeeTv(on, store.get().room?.code);
      socket.emit('presence', { canSeeTv: on });
    },
    leave() {
      socket.emit('leave', {});
      saveSession(null);
      dropRoomFromUrl();
      store.set({ joined: false, playerId: null, room: null, view: null, rev: -1 });
    },
    playHere() {
      holdReconnect = false;
      forceHere = true;
      store.set({ otherTab: false });
      const session = loadSession();
      if (socket.connected && session) sendJoin(session, session.token);
      else socket.connect(); // the connect handler joins with the stored login
      // (B: "Play here" is a deliberate take-over, so it does not ask the other tabs)
    },
    dismissError: () => store.set({ error: null }),
    dismissToast: (id) => store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
    session: loadSession,
    identity: loadIdentity,
  };
}
