// Route `/tv` — the stage. Renders pushed snapshots/views, plays sound cues on
// transitions, and never sends player events. `?room=CODE` watches a specific room.
import { useEffect, useMemo, useRef } from 'react';
import type { JSX } from 'react';
import { ServerClockProvider, isSoundCue } from '@partybox/game-sdk/ui';
import { clientGames } from '../games.generated';
import { useStore } from '../net/store';
import { createTvClient } from '../net/tv';
import { createSoundEngine, joinSemitones } from '../sound';
import type { SoundEngine } from '../sound';
import { AudioGate } from './AudioGate';
import { HostBar } from './HostBar';
import { TvFrame } from './TvFrame';
import { TvLobby } from './TvLobby';
import { TvPlaying } from './TvPlaying';
import { TvResults } from './TvResults';
import { TvSelecting } from './TvSelecting';
import styles from './TvApp.module.css';

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
  const prev = useRef<{
    players: number;
    ids: Set<string>;
    status: string;
    phase: string | null;
    paused: boolean;
    code: string;
  }>({ players: 0, ids: new Set(), status: '', phase: null, paused: false, code: '' });
  const lastLeaveAt = useRef(-Infinity);
  useEffect(() => {
    if (!room) return;
    const p = prev.current;
    // One `leave` per snapshot (a human leaving takes their bots with them, ADR-028) and never
    // more than one per 300 ms, so "Remove 4 bots" is one note, not four. A new room (Home reset)
    // is not a departure.
    if (p.status !== '' && p.code === room.code) {
      const ids = new Set(room.players.map((pl) => pl.id));
      const gone = [...p.ids].some((id) => !ids.has(id));
      if (gone && performance.now() - lastLeaveAt.current >= 300) {
        lastLeaveAt.current = performance.now();
        audio.play('leave');
      }
    }
    const paused = view?.paused ?? false;
    if (room.status === 'playing' && paused && !p.paused) audio.play('pause');
    else if (room.status === 'playing' && !paused && p.paused && p.status === 'playing')
      if (performance.now() - audio.lastPlayedAt() > 50) audio.play('phase');
    if (room.players.length > p.players && p.status !== '')
      audio.play('join', { semitones: joinSemitones(room.players.length) });
    // A game begins: a held G-major arpeggio (the intro itself never chimes — p.phase is null);
    // a TV that reloads mid-game (p.status === '') stays quiet, like the join rule.
    if (room.status === 'playing' && p.status !== 'playing' && p.status !== '') audio.play('start');
    if (room.status === 'results' && p.status !== 'results') audio.play('win');
    // A game that cued this phase itself (useSound, child effects run first) keeps the stage's
    // generic chime out of its way. `clientModule.sounds` maps a phase id to its own cue (reveal,
    // wager, tally…); unmapped phases play `phase`, reserved for "your phone needs you".
    if (view && view.phaseId !== p.phase && p.phase !== null && room.status === 'playing')
      if (performance.now() - audio.lastPlayedAt() > 50) {
        const mapped = room.selectedGameId
          ? clientGames[room.selectedGameId]?.sounds?.[view.phaseId]
          : undefined;
        audio.play(mapped && isSoundCue(mapped) ? mapped : 'phase');
      }
    prev.current = {
      players: room.players.length,
      ids: new Set(room.players.map((pl) => pl.id)),
      status: room.status,
      phase: view?.phaseId ?? null,
      paused,
      code: room.code,
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
        <div key={room?.status ?? 'none'} className={styles.swap}>
          {content}
        </div>
      </TvFrame>
      <AudioGate audio={audio} />
    </ServerClockProvider>
  );
}
