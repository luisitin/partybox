// Route `/tv` — the stage. Renders pushed snapshots/views, plays sound cues on
// transitions, and never sends player events. `?room=CODE` watches a specific room.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { AvatarPhotos, ServerClockProvider, isSoundCue, useLang } from '@partybox/game-sdk/ui';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import { useStore } from '../net/store';
import { createTvClient } from '../net/tv';
import { bedFor, createBedEngine } from '../beds';
import type { BedEngine } from '../beds';
import { createMusicEngine, planFor } from '../music';
import { nobodyScored } from '../controller/results-rows';
import type { MusicEngine } from '../music';
import { createSoundEngine, joinSemitones, lockSemitones } from '../sound';
import type { SoundEngine } from '../sound';
import { AsleepBanner } from './AsleepBanner';
import { AudioGate } from './AudioGate';
import { PhoneOnTvHint } from '../surface/SurfaceHint';
import { refreshServerInfo } from '../net/info';
import { HostBar } from './HostBar';
import { roomFullToast, seatOpenedToast, soundToast } from './own-toasts';
import { TvFrame } from './TvFrame';
import { tvContent } from './tvContent';
import { CrossfadeSwap } from '../CrossfadeSwap';
import styles from './TvApp.module.css';

let bedEngine: BedEngine | null = null;
function bedsInstance(muted: boolean): BedEngine {
  if (!bedEngine) {
    bedEngine = createBedEngine();
    bedEngine.setMuted(muted);
  }
  return bedEngine;
}
let sound: SoundEngine | null = null;
function soundInstance(): SoundEngine {
  // A cue ducks the music bed under it (ADR-032) — except the small ticks: a lock per player and
  // a countdown tick per second made the Lightning pulse bed pump five times a question (loop 400).
  sound = sound ?? createSoundEngine({ onPlay: (cue) => bedEngine?.duck(cue) });
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
  // The stage follows the TV's language (the host bar's 🌐, `?lang=`): a switch re-renders from
  // here. Never a re-key — this component owns the socket client and the audio engines.
  useLang();
  const roomCode = new URLSearchParams(location.search).get('room') ?? undefined;
  const client = useMemo(() => createTvClient(roomCode), [roomCode]);
  const audio = useMemo(() => soundInstance(), []);
  const music = useMemo(() => musicInstance(audio.muted()), [audio]);
  const beds = useMemo(() => bedsInstance(audio.muted()), [audio]);
  const bedTurns = useRef<Record<string, number>>({});
  const bedPhase = useRef<string | null>(null);
  const state = useStore(client.store, (s) => s);
  const room = state.room;
  const view = state.view;
  // The last board of the game, kept for the results stage ("adjust state when a prop changes").
  const [lastView, setLastView] = useState<typeof view>(null);
  if (room?.status === 'playing' && view && view !== lastView) setLastView(view);
  // The lobby snapshot is held over the stage until the game component has painted (loop #10);
  // reset whenever a game is not running, so the next start holds again.
  const [gameReady, setGameReady] = useState(false);
  if (room?.status !== 'playing' && gameReady) setGameReady(false);
  const markGameReady = useCallback(() => setGameReady(true), []);

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
    // Synthesized beds by phase (ADR-032): same gate, same mute, same pause.
    const gameBeds = room?.selectedGameId ? clientGames[room.selectedGameId]?.beds : undefined;
    // How often each phase has begun, so a phase that names several beds rotates through them
    // instead of replaying one bed every round (loop #197).
    const phase = room?.status === 'playing' ? (view?.phaseId ?? null) : null;
    if (phase !== bedPhase.current) {
      if (bedPhase.current !== null)
        bedTurns.current[bedPhase.current] = (bedTurns.current[bedPhase.current] ?? 0) + 1;
      bedPhase.current = phase;
    }
    // Every game starts its rotation from the first bed: the counts belong to one game, not to
    // the TV's whole evening (a second Wisecrack's first vote began on the lo-fi bed otherwise).
    if (phase === null) bedTurns.current = {};
    beds.play(bedFor(room, view, gameBeds, bedTurns.current));
    beds.setPaused(room?.status === 'playing' && (view?.paused ?? false));
  }, [room, view, music, beds]);
  // I-032 A: tension from the deadline — the last ten seconds ramp 0 → 1; none without a deadline.
  useEffect(() => {
    const deadline = room?.status === 'playing' && !view?.paused ? (view?.deadline ?? null) : null;
    if (deadline === null) {
      beds.setTension(0);
      return undefined;
    }
    const tick = (): void => {
      const left = (deadline - (Date.now() + state.offsetMs)) / 1000;
      beds.setTension(left > 10 ? 0 : left < 0 ? 1 : 1 - left / 10);
    };
    tick();
    const h = setInterval(tick, 250);
    return () => clearInterval(h);
  }, [room?.status, view?.deadline, view?.paused, state.offsetMs, beds]);

  // Sound cues from state transitions (docs/DESIGN_SYSTEM.md).
  const prev = useRef<{
    players: number;
    ids: Set<string>;
    status: string;
    phase: string | null;
    deadline: number | null;
    paused: boolean;
    code: string;
    locked: number;
    /** I-009 B: who was offline last snapshot — a drop plays `leave`, a return `join`. */
    offline: Set<string>;
  }>({
    players: 0,
    ids: new Set(),
    offline: new Set(),
    status: '',
    phase: null,
    deadline: null,
    paused: false,
    code: '',
    locked: 0,
  });
  const lastLeaveAt = useRef(-Infinity);
  // I-054 C: a toast the TV raises for itself (the store's shipped toast list, 3 s).
  const showLocalToast = useCallback(
    (toast: { kind: 'info' | 'success' | 'warning'; text: string }): void => {
      const id = Date.now();
      client.store.set((prev) => ({ toasts: [...prev.toasts.slice(-1), { id, ...toast }] }));
      setTimeout(
        () => client.store.set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),
        3000,
      );
    },
    [client],
  );
  const lastLockAt = useRef(-Infinity);
  const homing = state.homing;
  // I-744 B: the room code changed without the TV's own 🏠 reset — the server restarted
  // (SECOND BUILD: a restarted dev server reloads the TV page, so the last code is kept in
  //  sessionStorage, not only in memory.)
  const [restarted, setRestarted] = useState<string | null>(null);
  useEffect(() => {
    if (!room) return;
    const p = prev.current;
    let last: string | null = null;
    try {
      last = sessionStorage.getItem('pb:tvRoom');
      sessionStorage.setItem('pb:tvRoom', room.code);
    } catch {
      /* no storage: the in-memory check below still works without a reload */
    }
    const before = p.status !== '' ? p.code : last;
    if (before && before !== room.code && !homing) setRestarted(room.code);
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
    // I-009 B: a link dropping or returning mid-room — the room's own leave/join pair, one per
    // 300 ms like the leave rule; a fresh room (Home reset) or a TV reload says nothing.
    if (p.status !== '' && p.code === room.code) {
      const offlineNow = new Set(room.players.filter((pl) => !pl.connected).map((pl) => pl.id));
      const dropped = [...offlineNow].some((id) => !p.offline.has(id) && p.ids.has(id));
      const back = [...p.offline].some(
        (id) => !offlineNow.has(id) && room.players.some((pl) => pl.id === id),
      );
      if ((dropped || back) && performance.now() - lastLeaveAt.current >= 300) {
        lastLeaveAt.current = performance.now();
        audio.play(dropped ? 'leave' : 'join');
      }
    }
    const paused = view?.paused ?? false;
    if (room.status === 'playing' && paused && !p.paused) audio.play('pause');
    else if (room.status === 'playing' && !paused && p.paused && p.status === 'playing')
      if (performance.now() - audio.lastPlayedAt() > 50) audio.play('phase');
    if (room.players.length > p.players && p.status !== '')
      audio.play('join', { semitones: joinSemitones(room.players.length) });
    // I-054 A: the room closing — the hushed `close` chord after the join note at capacity.
    const fullNow = room.players.length >= room.capacity;
    const fullBefore = p.players >= room.capacity;
    if (p.status !== '' && fullNow && !fullBefore) {
      setTimeout(() => audio.play('close'), 500);
      showLocalToast({
        kind: 'info',
        text: roomFullToast(room.players.length, room.capacity), // worded when shown (TvFrame)
      });
    }
    // I-054 B: a seat opening — the `ready` chime after the leave note.
    if (p.status !== '' && !fullNow && fullBefore) {
      setTimeout(() => audio.play('ready'), 350);
      showLocalToast({
        kind: 'success',
        text: seatOpenedToast(room.players.length, room.capacity),
      });
    }
    // A game begins: a held G-major arpeggio (the intro itself never chimes — p.phase is null);
    // a TV that reloads mid-game (p.status === '') stays quiet, like the join rule.
    if (room.status === 'playing' && p.status !== 'playing' && p.status !== '') audio.play('start');
    // The winner moment (owner pick): a party horn with a crowd cheer under it (music ducked).
    if (room.status === 'results' && p.status !== 'results' && !homing) {
      // I-128 C: an all-zero board gets a soft note, not the cheer.
      // I-546: a game the VIP stopped gets the same soft note
      if (nobodyScored(room) || room.results?.endedEarly) audio.play('leave', { quiet: true });
      else {
        music.duck(9000);
        // I-037 C: several winners — the suspended chord, not the horn.
        audio.play((room.results?.results.winnerIds.length ?? 0) > 1 ? 'tie' : 'cheer');
      }
    }
    // A game that cued this phase itself (useSound, child effects run first) keeps the stage's
    // generic chime out of its way. `clientModule.sounds` maps a phase id to its own cue (reveal,
    // wager, tally…); unmapped phases play `phase`, reserved for "your phone needs you".
    if (view && p.phase !== null && room.status === 'playing') {
      const mapped = room.selectedGameId
        ? clientGames[room.selectedGameId]?.sounds?.[view.phaseId]
        : undefined;
      // A phase that re-enters itself (Blanks reads one card per instance) chimes again, but only
      // when the game mapped a cue for it: the deadline moves with the instance, never on a pause.
      const reentered =
        view.phaseId === p.phase &&
        mapped !== undefined &&
        view.deadline !== p.deadline &&
        !paused &&
        !p.paused;
      if ((view.phaseId !== p.phase || reentered) && performance.now() - audio.lastPlayedAt() > 50)
        audio.play(mapped && isSoundCue(mapped) ? mapped : 'phase');
    }
    // A lock-in: one soft tick per push, rising with the count (never queued; dropped inside
    // 250 ms), quiet so it never suppresses the phase chime; the count resets with the phase.
    // A detail, so it yields: nothing within 300 ms of any other cue the TV played (Bingo's
    // winner ticks in as the cheer starts — the tick sat 46 ms under it, loop 298).
    const locked =
      view && room.status === 'playing'
        ? view.players.filter((pl) => pl.status === 'submitted').length
        : 0;
    const ownLock =
      view && room.selectedGameId
        ? (clientGames[room.selectedGameId]?.ownLocks?.includes(view.phaseId) ?? false)
        : false;
    if (
      view &&
      room.status === 'playing' &&
      view.phaseId === p.phase &&
      locked > p.locked &&
      !ownLock &&
      performance.now() - lastLockAt.current >= 250 &&
      performance.now() - audio.lastPlayedAt() > 300
    ) {
      lastLockAt.current = performance.now();
      audio.play('lock', { semitones: lockSemitones(locked), quiet: true });
    }
    prev.current = {
      players: room.players.length,
      ids: new Set(room.players.map((pl) => pl.id)),
      offline: new Set(room.players.filter((pl) => !pl.connected).map((pl) => pl.id)),
      status: room.status,
      phase: view?.phaseId ?? null,
      deadline: view?.deadline ?? null,
      paused,
      code: room.code,
      locked: view && view.phaseId === p.phase ? locked : 0,
    };
  }, [room, view, audio, music, homing, showLocalToast]);

  // I-658 B: a new room (a start over) means a new QR — fetch it now, not within the minute
  const liveCode = room?.code ?? null;
  useEffect(() => {
    if (liveCode) refreshServerInfo();
  }, [liveCode]);
  const content = tvContent({
    room,
    view,
    lastView,
    toasts: state.toasts,
    client,
    audio,
    music,
    onGameReady: markGameReady,
  });

  return (
    <ServerClockProvider offsetMs={state.offsetMs}>
      <AvatarPhotos players={room?.players}>
        <TvFrame
          room={room}
          connected={state.connected}
          toasts={state.toasts}
          compact={room?.status === 'playing'}
          onHome={client.home}
          footer={room ? <HostBar client={client} room={room} view={view} /> : null}
        >
          {/* Game start: hold the lobby until the first game view has painted, so the stage never
            flickers through "Connecting…" / empty / "Getting the game ready…" (review-loop #10). */}
          <CrossfadeSwap
            swapKey={room?.status ?? 'none'}
            className={styles.swap}
            hold={room?.status === 'playing' && !gameReady}
            curtain={room?.status === 'playing'} /* I-120 A: the lobby leaves behind a curtain */
          >
            {content}
          </CrossfadeSwap>
        </TvFrame>
        <AsleepBanner asleep={room?.asleep === true} />
        {/* I-744 B: say what happened, until someone is back in */}
        {restarted && room?.code === restarted && !room.players.some((pl) => !pl.bot) ? (
          <div className={styles.restartBanner} role="status">
            {t.tv.restartedBefore} <strong>{restarted}</strong>. {t.tv.restartedAfter}
          </div>
        ) : null}
      </AvatarPhotos>
      <AudioGate
        audio={audio}
        music={music}
        beds={beds}
        onToggle={(m) => showLocalToast({ kind: 'info', text: soundToast(m) })}
      />
      {/* I-677: the TV page on a phone offers joining as a player */}
      <PhoneOnTvHint code={room?.code ?? null} />
    </ServerClockProvider>
  );
}
