// Route `/` — the phone. Owns the singleton controller connection and switches screens on the room
// status. Game components are loaded lazily from the generated registry.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { AvatarPhotos, ServerClockProvider, useLang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { createController } from '../net/controller';
import type { Controller } from '../net/controller';
import { useStore } from '../net/store';
import { PHONE_MUTE_KEY, createSoundEngine } from '../sound';
import type { SoundEngine } from '../sound';
import { ControllerShell } from './ControllerShell';
import { BigScreenHint } from '../surface/SurfaceHint';
import { CrossfadeSwap, screenKey } from '../CrossfadeSwap';
import { StartStage } from './StartStage';
import { buzz } from '@partybox/game-sdk/ui';
const SUBMIT_BUZZ = 20; // I-070 B: the same pattern a submit uses
import { Join } from './Join';
import { OtherTab } from './OtherTab';
import { useSyncExternalStore } from 'react';
import type { PushedView, TvView } from '@partybox/shared';
import { useGame } from '../game-loader';
import { bedFor, createBedEngine } from '../beds';
import type { MusicEngine } from '../music';
import { createMusicEngine, planFor } from '../music';
import {
  phoneMusicChoice,
  phoneMusicWanted,
  subscribePhoneMusic,
  phoneMusicVolume,
} from '../phone-music';
import { Lobby } from './Lobby';
import { Playing } from './Playing';
import { Results } from './Results';
import { Selecting } from './Selecting';
import { gameEntry } from '../catalog';

let singleton: Controller | null = null;
function controllerInstance(): Controller {
  singleton = singleton ?? createController();
  return singleton;
}

// The phone's own cues (submit, error, a game's verdict card) — quiet, so the TV stays the
// audible focal point of the room; the phone never plays the TV's join/phase/win cues.
let sound: SoundEngine | null = null;
// The caller's voice ducks the phone's music while it speaks (S-005 + the owner, 2026-09-21:
// "the caller voice is too quiet on phone … louder than background music"): the voice itself
// bypasses the 0.35 cue master (sound.ts), and the music dips for the clip's length.
let phoneMusic: MusicEngine | null = null;
function soundInstance(): SoundEngine {
  sound =
    sound ??
    createSoundEngine({
      master: 0.35,
      muteKey: PHONE_MUTE_KEY,
      onClip: (ms) => phoneMusic?.duck(ms + 300),
    });
  return sound;
}

export function ControllerApp(): JSX.Element {
  const controller = useMemo(() => controllerInstance(), []);
  const audio = useMemo(() => soundInstance(), []);
  // S-004: music on this phone — the TV's plan, on the phone's own engine, while the switch is on.
  const music = useMemo(() => createMusicEngine(), []);
  useEffect(() => {
    phoneMusic = music;
    return () => {
      phoneMusic = null;
    };
  }, [music]);
  const musicChoice = useSyncExternalStore(subscribePhoneMusic, phoneMusicChoice, () => null);
  const musicVolume = useSyncExternalStore(subscribePhoneMusic, phoneMusicVolume, () => 70);
  const state = useStore(controller.store, (s) => s);
  // The device's language (the join pills, the 🎨 sheet): subscribing re-renders every screen, and
  // `t` reads the language at render. No remount — the 🎨 sheet stays open and a typed answer or a
  // drawing in progress survives the switch (the owner, 2026-09-22).
  useLang();
  // Autoplay policy: the AudioContext needs a gesture. Every tap re-checks (idempotent) so a
  // context iOS suspended while the phone was locked comes back on the next touch.
  useEffect(() => {
    const start = (): void => {
      void audio.enable();
    };
    document.addEventListener('pointerdown', start);
    return () => document.removeEventListener('pointerdown', start);
  }, [audio]);
  // The game's synthesized beds too (Wisecrack's vote / reveal, Lightning's phases): a phone
  // that carries the room's audio ran the MP3 sets but sat silent under a bed-only phase (the
  // owner, 2026-09-21: "some games had no music / sound (like wisecrack)").
  const beds = useMemo(() => createBedEngine(), []);
  useEffect(() => {
    const start = (): void => {
      music.enable();
      void beds.enable();
    };
    document.addEventListener('pointerdown', start);
    return () => document.removeEventListener('pointerdown', start);
  }, [music, beds]);
  // The phone's Sound switch silences ALL of the phone's audio — the music and the beds follow
  // the cue engine's mute. Until 2026-09-22 they ignored it, so a player who switched sound off
  // in a phone-only room still got the game's beds (the audio sweep found it).
  useEffect(() => {
    const apply = (m: boolean): void => {
      music.setMuted(m);
      beds.setMuted(m);
    };
    apply(audio.muted());
    return audio.onMuteChange(apply);
  }, [audio, music, beds]);
  // The plan is derived (no state): the VIP's room-wide switch (S-004, the owner: "if VIP
  // enables it, then it is auto for everyone") or this phone's own; the effect drives the engine.
  const room = state.room;
  const view = state.view as PushedView<TvView> | null;
  // A "phone only" room has no TV to play the game's music, so the phones do — the rule the beds
  // below already followed. Without it a game with music but no beds (Broken Pencil) was silent
  // on every phone in a phone-only room (the 2026-09-22 audio sweep: 2 sounds in a whole game).
  // The phone's own switch wins once touched (the owner, 2026-09-23: Off did not turn it off).
  const remote = room?.players.find((p) => p.id === state.playerId)?.canSeeTv === false;
  const musicWanted = phoneMusicWanted(musicChoice, room, remote);
  // ADR-050: the chosen game's phone entry — this is also what starts its download (§2.3).
  const game = useGame(room?.selectedGameId, 'phone').module;
  const gameMusic = game?.music;
  const plan = musicWanted ? planFor(room, view, gameMusic) : null;
  const gameName = gameEntry(room?.selectedGameId)?.name;
  const musicWhat = !musicWanted
    ? null
    : plan
      ? plan.id === 'lobby'
        ? t.music.lobbySet
        : gameName
          ? t.music.gameSet(gameName)
          : t.music.anyGameSet
      : t.music.quietForNow;
  const planId = plan?.id ?? null;
  const paused = room?.status === 'playing' && (view?.paused ?? false);
  const results = room?.status === 'results';
  useEffect(() => {
    music.play(plan ? { ...plan, volume: plan.volume * (musicVolume / 100) } : null);
    music.setPaused(paused);
    // S-004 B: the phone ducks with the TV's cheer on results.
    if (results) music.duck(9000);
    // `plan` is a fresh object per render; its id and level are the identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music, planId, musicVolume, paused, results]);
  const bedTurns = useRef<Record<string, number>>({});
  const bedPhase = useRef<string | null>(null);
  const gameBeds = game?.beds;
  const bedsWanted = musicWanted;
  useEffect(() => {
    // the TV's rotation rule (TvApp): a phase that names several beds turns through them
    const phase = bedsWanted && room?.status === 'playing' ? (view?.phaseId ?? null) : null;
    if (phase !== bedPhase.current) {
      if (bedPhase.current !== null)
        bedTurns.current[bedPhase.current] = (bedTurns.current[bedPhase.current] ?? 0) + 1;
      bedPhase.current = phase;
    }
    if (phase === null) bedTurns.current = {};
    beds.setVolume(musicVolume / 100);
    beds.play(bedsWanted ? bedFor(room, view, gameBeds, bedTurns.current) : null);
    beds.setPaused(paused);
  }, [beds, bedsWanted, room, view, gameBeds, paused, musicVolume]);
  const me = state.room?.players.find((p) => p.id === state.playerId) ?? null;
  // I-070 B: a nudge is felt on the VIP's phone — a buzz and the `phase` note as the toast lands.
  const lastNudge = useRef(0);
  useEffect(() => {
    const nudge = state.toasts.find((x) => x.text.startsWith('👋') && x.id !== lastNudge.current);
    if (!nudge || !me?.isVip) return;
    lastNudge.current = nudge.id;
    buzz(SUBMIT_BUZZ);
    audio.play('phase');
  }, [state.toasts, me?.isVip, audio]);
  // Game start holds the previous screen until the game component has painted (review-loop #11):
  // no "Getting the game ready…" flash on a LAN. Reset whenever a game is not running.
  const [gameReady, setGameReady] = useState(false);
  if (state.room?.status !== 'playing' && gameReady) setGameReady(false);
  const markGameReady = useCallback(() => setGameReady(true), []);
  // S-003 B: the lobby's pill opens the shell's 🎨 sheet (a counter: every tap opens).
  const [setupOpen, setSetupOpen] = useState(0);

  let screen: JSX.Element;
  if (state.otherTab) {
    screen = <OtherTab onPlayHere={controller.playHere} />; // I-755 A
  } else if (!state.joined || !state.room || !me) {
    screen = <Join controller={controller} state={state} audio={audio} />;
  } else {
    switch (state.room.status) {
      case 'lobby':
        screen = (
          <Lobby
            controller={controller}
            room={state.room}
            me={me}
            audio={audio}
            onSetup={() => setSetupOpen((n) => n + 1)}
          />
        );
        break;
      case 'selecting':
        // ADR-053: between Start and the game, the start stage (rules, READY, 3·2·1)
        screen = state.room.starting ? (
          <StartStage controller={controller} room={state.room} me={me} audio={audio} />
        ) : (
          <Selecting controller={controller} room={state.room} me={me} />
        );
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
      <AvatarPhotos players={state.room?.players}>
        <ControllerShell
          controller={controller}
          state={state}
          me={me}
          audio={audio}
          openTheme={setupOpen}
          musicWhat={musicWhat}
        >
          <CrossfadeSwap
            swapKey={!state.joined || !state.room || !me ? 'join' : screenKey(state.room)}
            delayMs={
              state.room?.status === 'playing' ? 200 : 0
            } /* I-039 A: a beat between phase screens */
            hold={state.room?.status === 'playing' && !gameReady}
          >
            {screen}
          </CrossfadeSwap>
        </ControllerShell>
        {/* I-677: the join page on a big screen offers the TV view */}
        {!state.joined ? <BigScreenHint /> : null}
      </AvatarPhotos>
    </ServerClockProvider>
  );
}
