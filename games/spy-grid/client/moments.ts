// The TV's sounds and voice, landed on their frames (SPEC §9.4 sound column, §9.17). The TV stage
// remounts per phase, so each phase's cues play from its mount: `phase` when a turn's guessing
// opens, `reveal` as a card lifts and the identity's sting as its face lands, the fanfare at a
// win and `win` when the ripple has finished. The reader's line plays once per key, the flip's
// line delayed to the moment the face shows.
import { useEffect, useRef } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';
import type { SoundApi } from '@partybox/game-sdk/ui';
import type { SpyControllerView, SpyTvView } from '../server/views';
import { RIPPLE_MS } from './model';

/** When the turning card shows its face (the `turn` keyframe's midpoint is the edge-on frame). */
export const FACE_AT_MS = 330;
export const TURN_MS = 600;

export function useVoice(view: SpyTvView | SpyControllerView, on = true): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  const key = on ? (view.voice?.key ?? null) : null;
  const url = view.voice?.url ?? null;
  const delayMs = view.phaseId === 'flip' ? FACE_AT_MS : 0;
  useEffect(() => {
    if (!key || !url || said.current.has(key)) return;
    said.current.add(key);
    sound.hush();
    sound.clip(url, { gain: 1, duck: false, delayMs });
  }, [key, url, delayMs, sound]);
}

function after(ms: number, fn: () => void): () => void {
  const t = setTimeout(fn, ms);
  return () => clearTimeout(t);
}

function flipSting(view: SpyTvView, sound: SoundApi): void {
  const card = view.flipping?.card ?? -1;
  const kind = view.kinds[card];
  if (kind === 'assassin' || (kind && kind !== 'bystander' && kind !== view.turnTeam))
    sound.play('bust');
  else if (kind === 'bystander') sound.play('tie');
  else if (kind) sound.play('correct', { gain: 0.7 });
}

/** Cues for the phase this TV stage just mounted into. */
export function useTvMoments(view: SpyTvView): void {
  const sound = useSoundApi();
  const phase = view.phaseId;
  const turnStart = phase === 'guess' && !view.canEnd;
  const rippleEnd = view.ripple.length * RIPPLE_MS + TURN_MS;
  const winOnMount = phase === 'win';
  const flipOnMount = phase === 'flip';
  useEffect(() => {
    if (turnStart) sound.play('phase');
    if (flipOnMount) {
      sound.play('reveal');
      return after(FACE_AT_MS, () => flipSting(view, sound));
    }
    if (winOnMount) {
      sound.play('fanfare');
      return after(rippleEnd, () => sound.play('win', { gain: 0.8 }));
    }
    return undefined;
    // Mount-only on purpose: the stage remounts per phase, and a flip's stage 2 must not re-cue.
  }, []);
}
