// The shell's cues and haptics from state transitions, mirroring the TV's (TvApp): the phone only
// sounds for what happened in the player's hand (submit, error) and buzzes for the rest
// (docs/DESIGN_SYSTEM.md). Moved out of ControllerShell (the 300-line cap).
import { useEffect, useRef } from 'react';
import { buzz } from '@partybox/game-sdk/ui';
import { peekGame } from '../game-loader';
import type { ControllerState } from '../net/controller';
import type { SoundCue, SoundEngine } from '../sound';
import { BUZZ } from './haptics';
import { tvSoundsOn } from './PhoneSettings';

export function useShellCues(
  state: ControllerState,
  myStatus: string | null,
  online: boolean,
  audio: SoundEngine | undefined,
): void {
  const room = state.room;
  const prev = useRef<{
    status: string | null;
    phase: string | null;
    roomStatus: string;
    error: ControllerState['error'];
  }>({ status: null, phase: null, roomStatus: '', error: null });
  // I-009 C: the link comes back — it lands in the hand: one short buzz and the `join` note.
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current) {
      audio?.play('join');
      buzz(BUZZ.back);
    }
    wasOnline.current = online;
  }, [online, audio]);
  useEffect(() => {
    const p = prev.current;
    const roomStatus = room?.status ?? '';
    const phase = state.view?.phaseId ?? null;
    const error = state.error;
    const playing = roomStatus === 'playing';
    // Locked in: the phone's own confirmation (a game that just cued its verdict wins the beat).
    if (playing && myStatus === 'submitted' && p.status !== 'submitted' && p.status !== null) {
      if (audio && performance.now() - audio.lastPlayedAt() > 50) audio.play('submit');
      buzz(BUZZ.submit);
    }
    // S-005 C: the TV's phase cue on this phone (a phone-only room, the phone opted in).
    if (
      playing &&
      phase !== null &&
      p.phase !== phase &&
      // a room that asked the phones to carry the audio (phone only, or music on every phone)
      // or this phone is the stage: ADR-047's remote player hears the TV's cues (ruling 14)
      (room?.phoneOnly || room?.musicOnPhones || state.view?.phoneOnly === true) &&
      tvSoundsOn() &&
      audio
    ) {
      const mapped = room?.selectedGameId
        ? peekGame(room.selectedGameId, 'phone')?.sounds?.[phase]
        : undefined;
      if (mapped && mapped !== 'silence') audio.play(mapped as SoundCue);
    }
    // A rejected join or input, once per error object: the strip goes red (Join renders the
    // same error inline).
    if (error && error !== p.error) {
      audio?.play('error');
      // I-040 C: a taken name buzzes twice — the one join error that is about someone else.
      buzz(error.code === 'name_taken' ? [40, 60, 40] : BUZZ.error);
    }
    // The phone needs the player (a new prompt): a buzz only — the TV plays `phase`.
    if (
      playing &&
      phase !== null &&
      p.phase !== null &&
      phase !== p.phase &&
      myStatus === 'active' &&
      state.view?.timerMode !== 'quiet'
    )
      buzz(BUZZ.prompt);
    // Results: a longer pattern for a winner, one nudge for everyone else — the TV plays `win`.
    if (roomStatus === 'results' && p.roomStatus !== 'results' && p.roomStatus !== '') {
      const won =
        state.playerId !== null && room?.results?.results.winnerIds.includes(state.playerId);
      buzz(won ? BUZZ.winner : BUZZ.results);
    }
    prev.current = {
      status: playing ? myStatus : null,
      phase: playing ? phase : null,
      roomStatus,
      error,
    };
  }, [room, state.view, state.error, state.playerId, myStatus, audio]);
}
