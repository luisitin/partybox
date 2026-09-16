// Route `/` — the phone. Owns the singleton controller connection and switches screens on the room
// status. Game components are loaded lazily from the generated registry.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { ServerClockProvider } from '@partybox/game-sdk/ui';
import { createController } from '../net/controller';
import type { Controller } from '../net/controller';
import { useStore } from '../net/store';
import { PHONE_MUTE_KEY, createSoundEngine } from '../sound';
import type { SoundEngine } from '../sound';
import { ControllerShell } from './ControllerShell';
import { CrossfadeSwap } from '../CrossfadeSwap';
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

// The phone's own cues (submit, error, a game's verdict card) — quiet, so the TV stays the
// audible focal point of the room; the phone never plays the TV's join/phase/win cues.
let sound: SoundEngine | null = null;
function soundInstance(): SoundEngine {
  sound = sound ?? createSoundEngine({ master: 0.35, muteKey: PHONE_MUTE_KEY });
  return sound;
}

export function ControllerApp(): JSX.Element {
  const controller = useMemo(() => controllerInstance(), []);
  const audio = useMemo(() => soundInstance(), []);
  const state = useStore(controller.store, (s) => s);
  // Autoplay policy: the AudioContext needs a gesture. Every tap re-checks (idempotent) so a
  // context iOS suspended while the phone was locked comes back on the next touch.
  useEffect(() => {
    const start = (): void => {
      void audio.enable();
    };
    document.addEventListener('pointerdown', start);
    return () => document.removeEventListener('pointerdown', start);
  }, [audio]);
  const me = state.room?.players.find((p) => p.id === state.playerId) ?? null;
  // Game start holds the previous screen until the game component has painted (review-loop #11):
  // no "Getting the game ready…" flash on a LAN. Reset whenever a game is not running.
  const [gameReady, setGameReady] = useState(false);
  if (state.room?.status !== 'playing' && gameReady) setGameReady(false);
  const markGameReady = useCallback(() => setGameReady(true), []);

  let screen: JSX.Element;
  if (!state.joined || !state.room || !me) {
    screen = <Join controller={controller} state={state} audio={audio} />;
  } else {
    switch (state.room.status) {
      case 'lobby':
        screen = <Lobby controller={controller} room={state.room} me={me} />;
        break;
      case 'selecting':
        screen = <Selecting controller={controller} room={state.room} me={me} />;
        break;
      case 'playing':
        screen = (
          <Playing
            controller={controller}
            room={state.room}
            me={me}
            view={state.view}
            audio={audio}
            onGameReady={markGameReady}
          />
        );
        break;
      case 'results':
        screen = <Results controller={controller} room={state.room} me={me} />;
        break;
    }
  }

  return (
    <ServerClockProvider offsetMs={state.offsetMs}>
      <ControllerShell controller={controller} state={state} me={me} audio={audio}>
        <CrossfadeSwap
          swapKey={!state.joined || !state.room || !me ? 'join' : state.room.status}
          hold={state.room?.status === 'playing' && !gameReady}
        >
          {screen}
        </CrossfadeSwap>
      </ControllerShell>
    </ServerClockProvider>
  );
}
