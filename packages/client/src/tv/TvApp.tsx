// Route `/tv` — the stage. Renders pushed snapshots/views, plays sound cues on
// transitions, and never sends player events. `?room=CODE` watches a specific room.
import { useEffect, useMemo, useRef } from 'react';
import type { JSX } from 'react';
import { ServerClockProvider } from '@partybox/game-sdk/ui';
import { useStore } from '../net/store';
import { createTvClient } from '../net/tv';
import { createSoundEngine } from '../sound';
import type { SoundEngine } from '../sound';
import { AudioGate } from './AudioGate';
import { HostBar } from './HostBar';
import { TvFrame } from './TvFrame';
import { TvLobby } from './TvLobby';
import { TvPlaying } from './TvPlaying';
import { TvResults } from './TvResults';
import { TvSelecting } from './TvSelecting';

let sound: SoundEngine | null = null;
function soundInstance(): SoundEngine {
  sound = sound ?? createSoundEngine();
  return sound;
}

export function TvApp(): JSX.Element {
  const roomCode = new URLSearchParams(location.search).get('room') ?? undefined;
  const client = useMemo(() => createTvClient(roomCode), [roomCode]);
  const audio = useMemo(() => soundInstance(), []);
  const state = useStore(client.store, (s) => s);
  const room = state.room;
  const view = state.view;

  // Sound cues from state transitions (docs/DESIGN_SYSTEM.md).
  const prev = useRef<{ players: number; status: string; phase: string | null }>({
    players: 0,
    status: '',
    phase: null,
  });
  useEffect(() => {
    if (!room) return;
    const p = prev.current;
    if (room.players.length > p.players && p.status !== '') audio.play('join');
    if (room.status === 'results' && p.status !== 'results') audio.play('win');
    // A game that cued this phase itself (useSound, child effects run first) keeps the stage's
    // generic chime out of its way.
    if (view && view.phaseId !== p.phase && p.phase !== null && room.status === 'playing')
      if (performance.now() - audio.lastPlayedAt() > 50) audio.play('phase');
    prev.current = {
      players: room.players.length,
      status: room.status,
      phase: view?.phaseId ?? null,
    };
  }, [room, view, audio]);

  let content: JSX.Element;
  if (!room) content = <TvLobby room={null} />;
  else if (room.status === 'lobby') content = <TvLobby room={room} />;
  else if (room.status === 'selecting') content = <TvSelecting room={room} client={client} />;
  else if (room.status === 'playing') content = <TvPlaying room={room} view={view} audio={audio} />;
  else content = <TvResults room={room} />;

  return (
    <ServerClockProvider offsetMs={state.offsetMs}>
      <TvFrame
        room={room}
        connected={state.connected}
        toasts={state.toasts}
        compact={room?.status === 'playing'}
        onHome={client.home}
        footer={room ? <HostBar client={client} room={room} view={view} /> : null}
      >
        {content}
      </TvFrame>
      <AudioGate audio={audio} />
    </ServerClockProvider>
  );
}
