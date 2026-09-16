// Route `/tv` — the stage. Renders pushed snapshots/views, plays sound cues on
// transitions, and never sends player events. `?room=CODE` watches a specific room.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { ServerClockProvider, isSoundCue } from '@partybox/game-sdk/ui';
import { clientGames } from '../games.generated';
import { useStore } from '../net/store';
import { createTvClient } from '../net/tv';
import { createMusicEngine, planFor } from '../music';
import type { MusicEngine } from '../music';
import { createSoundEngine, joinSemitones, lockSemitones } from '../sound';
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
let musicEngine: MusicEngine | null = null;
function musicInstance(muted: boolean): MusicEngine {
  if (!musicEngine) {
    musicEngine = createMusicEngine();
    musicEngine.setMuted(muted);
  }
  return musicEngine;
}

export function TvApp(): JSX.Element {
  const roomCode = new URLSearchParams(location.search).get('room') ?? undefined;
  const client = useMemo(() => createTvClient(roomCode), [roomCode]);
  const audio = useMemo(() => soundInstance(), []);
  const music = useMemo(() => musicInstance(audio.muted()), [audio]);
  const state = useStore(client.store, (s) => s);
  const room = state.room;
  const view = state.view;
  // The last board of the game, kept for the results stage ("adjust state when a prop changes").
  const [lastView, setLastView] = useState<typeof view>(null);
  if (room?.status === 'playing' && view && view !== lastView) setLastView(view);

  // Nothing speaks outside play: a game's caller (Bingo) can leave Chrome's speech queue stuck,
  // and a stuck queue plays back later — in the lobby. The shell clears it on every status change.
  const status = room?.status ?? null;
  useEffect(() => {
    if (status !== 'playing' && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  }, [status]);

  // Background music follows the room (owner picks 2026-09-15): the lobby set while people gather
  // or the host picks a game, a game's own set while it plays, silence on results; a paused game
  // holds the track. It starts on the audio gate's first tap like the cues.
  useEffect(() => {
    const gameMusic = room?.selectedGameId ? clientGames[room.selectedGameId]?.music : undefined;
    music.play(planFor(room, view, gameMusic));
    music.setPaused(room?.status === 'playing' && (view?.paused ?? false));
  }, [room, view, music]);

  // Sound cues from state transitions (docs/DESIGN_SYSTEM.md).
  const prev = useRef<{
    players: number;
    ids: Set<string>;
    status: string;
    phase: string | null;
    paused: boolean;
    code: string;
    locked: number;
  }>({ players: 0, ids: new Set(), status: '', phase: null, paused: false, code: '', locked: 0 });
  const lastLeaveAt = useRef(-Infinity);
  const lastLockAt = useRef(-Infinity);
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
    // The winner moment (owner pick): a party horn with a crowd cheer under it.
    if (room.status === 'results' && p.status !== 'results') audio.play('cheer');
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
    // A lock-in: one soft tick per push, rising with the count (never queued; dropped inside
    // 250 ms), quiet so it never suppresses the phase chime; the count resets with the phase.
    const locked =
      view && room.status === 'playing'
        ? view.players.filter((pl) => pl.status === 'submitted').length
        : 0;
    if (
      view &&
      room.status === 'playing' &&
      view.phaseId === p.phase &&
      locked > p.locked &&
      performance.now() - lastLockAt.current >= 250
    ) {
      lastLockAt.current = performance.now();
      audio.play('lock', { semitones: lockSemitones(locked), quiet: true });
    }
    prev.current = {
      players: room.players.length,
      ids: new Set(room.players.map((pl) => pl.id)),
      status: room.status,
      phase: view?.phaseId ?? null,
      paused,
      code: room.code,
      locked: view && view.phaseId === p.phase ? locked : 0,
    };
  }, [room, view, audio]);

  let content: JSX.Element;
  if (!room) content = <TvLobby room={null} />;
  else if (room.status === 'lobby') content = <TvLobby room={room} />;
  else if (room.status === 'selecting') content = <TvSelecting room={room} client={client} />;
  else if (room.status === 'playing') content = <TvPlaying room={room} view={view} audio={audio} />;
  else content = <TvResults room={room} lastView={lastView} />;

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
      <AudioGate audio={audio} music={music} />
    </ServerClockProvider>
  );
}
