// Route /preview/:gameId/:fixture?view=tv|controller&player=<id> (dev only). Renders a fixture's
// view inside the REAL shells with no live state, so tools and AI sessions can look at any phase
// instantly. The view itself comes from GET /api/dev/preview (the server owns game logic).
import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import type {
  ControllerView,
  PlayerPublic,
  PushedView,
  RoomSnapshot,
  TvView,
} from '@partybox/shared';
import { ServerClockProvider } from '@partybox/game-sdk/ui';
import { ControllerShell } from '../controller/ControllerShell';
import { Playing } from '../controller/Playing';
import type { Controller, ControllerState } from '../net/controller';
import { createStore } from '../net/store';
import { createSoundEngine } from '../sound';
import { TvFrame } from '../tv/TvFrame';
import { TvPlaying } from '../tv/TvPlaying';

interface PreviewPayload {
  view: PushedView<TvView> | PushedView<ControllerView>;
  playerIds: string[];
}

interface Route {
  gameId: string;
  fixture: string;
  view: 'tv' | 'controller';
  player: string | null;
}

function parseRoute(): Route | null {
  const match = /^\/preview\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(location.pathname);
  if (!match) return null;
  const params = new URLSearchParams(location.search);
  return {
    gameId: match[1] as string,
    fixture: match[2] as string,
    view: params.get('view') === 'controller' ? 'controller' : 'tv',
    player: params.get('player'),
  };
}

function fakeRoom(gameId: string, view: PushedView<TvView>): RoomSnapshot {
  const players: PlayerPublic[] = view.players.map((p, i) => ({
    id: p.id,
    name: p.name,
    avatarId: p.avatarId,
    isVip: p.id === view.vip,
    connected: p.connected,
    spectator: p.status === 'spectator',
    joinedAt: i,
  }));
  return {
    code: 'PREV',
    status: 'playing',
    locked: false,
    capacity: 16,
    players,
    vip: view.vip,
    selectedGameId: gameId,
    settings: {},
    games: [],
    results: null,
    canStart: { ok: false, reason: 'preview' },
    recording: true,
    musicOnPhones: false,
    phoneOnly: false,
    listed: true,
  };
}

export function Preview(): JSX.Element {
  const route = useMemo(() => parseRoute(), []);
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audio = useMemo(() => createSoundEngine(), []);

  useEffect(() => {
    if (!route) return;
    const player = route.player ? `&player=${encodeURIComponent(route.player)}` : '';
    fetch(`/api/dev/preview/${route.gameId}/${route.fixture}?view=${route.view}${player}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({ error: res.statusText }))) as {
            error?: string;
          };
          throw new Error(`${res.status} ${body.error ?? ''}`);
        }
        return (await res.json()) as PreviewPayload;
      })
      .then(setPayload)
      .catch((err: Error) => setError(err.message));
  }, [route]);

  if (!route)
    return <Note text="Usage: /preview/<gameId>/<fixture>?view=tv|controller&player=<id>" />;
  if (error) return <Note text={`Preview failed: ${error} (is the dev API on? pnpm dev)`} />;
  if (!payload) return <Note text="Loading fixture…" />;

  if (route.view === 'tv') {
    const view = payload.view as PushedView<TvView>;
    const room = fakeRoom(route.gameId, view);
    return (
      <ServerClockProvider offsetMs={0}>
        <TvFrame room={room} connected toasts={[]} compact>
          <TvPlaying room={room} view={view} audio={audio} />
        </TvFrame>
      </ServerClockProvider>
    );
  }

  const view = payload.view as PushedView<ControllerView>;
  const room = fakeRoom(route.gameId, view);
  const me: PlayerPublic = room.players.find((p) => p.id === view.me.id) ?? {
    id: view.me.id,
    name: view.me.id,
    avatarId: 'ghost',
    isVip: false,
    connected: true,
    spectator: true,
    joinedAt: 0,
  };
  const state: ControllerState = {
    connection: 'connected',
    joined: true,
    resuming: false,
    playerId: me.id,
    room,
    view,
    rev: 1,
    offsetMs: 0,
    error: null,
    toasts: [],
    kicked: null,
    restarted: false,
  };
  const controller: Controller = {
    store: createStore(state),
    join: () => undefined,
    sendInput: (input) => console.log('[preview] send', input),
    vip: (action) => console.log('[preview] vip', action),
    bot: (action) => console.log('[preview] bot', action),
    nudge: () => console.log('[preview] nudge'),
    here: (on) => console.log('[preview] here', on),
    leave: () => undefined,
    dismissError: () => undefined,
    dismissToast: () => undefined,
    session: () => null,
    identity: () => null,
  };
  return (
    <ServerClockProvider offsetMs={0}>
      <ControllerShell controller={controller} state={state} me={me}>
        <Playing controller={controller} room={room} me={me} view={view} />
      </ControllerShell>
    </ServerClockProvider>
  );
}

function Note({ text }: { text: string }): JSX.Element {
  return (
    <p className="pb-muted" style={{ padding: 'var(--pb-space-6)' }}>
      {text}
    </p>
  );
}
