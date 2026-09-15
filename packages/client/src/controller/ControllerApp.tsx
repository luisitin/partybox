// Route `/` — the phone. Owns the singleton controller connection and switches screens on the room
// status. Game components are loaded lazily from the generated registry.
import { useMemo } from 'react';
import type { JSX } from 'react';
import { ServerClockProvider } from '@partybox/game-sdk/ui';
import { createController } from '../net/controller';
import type { Controller } from '../net/controller';
import { useStore } from '../net/store';
import { ControllerShell } from './ControllerShell';
import { Join } from './Join';
import { Lobby } from './Lobby';
import { Playing } from './Playing';
import { Results } from './Results';
import { Selecting } from './Selecting';

let singleton: Controller | null = null;
function controllerInstance(): Controller {
  singleton = singleton ?? createController();
  return singleton;
}

export function ControllerApp(): JSX.Element {
  const controller = useMemo(() => controllerInstance(), []);
  const state = useStore(controller.store, (s) => s);
  const me = state.room?.players.find((p) => p.id === state.playerId) ?? null;

  let screen: JSX.Element;
  if (!state.joined || !state.room || !me) {
    screen = <Join controller={controller} state={state} />;
  } else {
    switch (state.room.status) {
      case 'lobby':
        screen = <Lobby controller={controller} room={state.room} me={me} />;
        break;
      case 'selecting':
        screen = <Selecting controller={controller} room={state.room} me={me} />;
        break;
      case 'playing':
        screen = <Playing controller={controller} room={state.room} me={me} view={state.view} />;
        break;
      case 'results':
        screen = <Results controller={controller} room={state.room} me={me} />;
        break;
    }
  }

  return (
    <ServerClockProvider offsetMs={state.offsetMs}>
      <ControllerShell controller={controller} state={state} me={me}>
        {screen}
      </ControllerShell>
    </ServerClockProvider>
  );
}
