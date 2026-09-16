// The last 5 s of a real input phase for a player who has not answered: the phone (not the TV
// 3 m away) is what they are staring at, so it is the phone that gets urgent (R-050). `data-urgent`
// on the shell lets the SDK primitives (letters, the primary button) join in without a prop. A
// game marks nobody 'submitted' in a passive phase (intro, reveal, scores), so the shell also
// checks that the screen actually offers something to press — a WaitingScreen never panics.
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ControllerView, PlayerStatus, PushedView } from '@partybox/shared';
import { buzz } from '@partybox/game-sdk/ui';
import type { SoundEngine } from '../sound';

/** "Something to press": what makes the last 5 s urgent on this screen. */
const ACTIONABLE =
  'textarea:not(:disabled), input:not(:disabled), select:not(:disabled), ' +
  'button:not(:disabled):not([aria-disabled="true"]), [role="button"]:not([aria-disabled="true"])';

/** Haptic patterns (ms on/off) — docs/DESIGN_SYSTEM.md → Haptics. */
const BUZZ: Record<'tick' | 'timeup', number | number[]> = { tick: 30, timeup: [60, 40, 60] };

export interface PhoneUrgencyInput {
  view: PushedView<ControllerView> | null;
  seconds: number | null;
  myStatus: PlayerStatus | null;
  audio?: SoundEngine;
  /** False while the socket is down: a phone that cannot answer is never urged (review-loop #27). */
  online?: boolean;
}

export interface PhoneUrgency {
  /** Render-side half: the "Hurry!" cue is mounted while true (one word for pick, type and draw — review-loop #31) (CSS shows it under `data-urgent`). */
  candidate: boolean;
  shellRef: RefObject<HTMLDivElement | null>;
  mainRef: RefObject<HTMLElement | null>;
}

export function usePhoneUrgency({
  view,
  seconds,
  myStatus,
  audio,
  online = true,
}: PhoneUrgencyInput): PhoneUrgency {
  const timed =
    online && view !== null && view.timerMode !== 'quiet' && view.timerMode !== 'hidden';
  const acting = myStatus === 'active';
  const candidate =
    timed && !view.paused && seconds !== null && seconds >= 1 && seconds <= 5 && acting;
  const shellRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  // One haptic per second at 5…1, a soft tick at the 5 s edge, a thud at 0 for a phone that was
  // counting and still has not answered (Timer.tsx's `lastTicked` pattern, keyed per phase
  // instance; per-second is haptic-only so N phones never flam against the TV's countdown).
  const lastTicked = useRef<{ key: string; seconds: number } | null>(null);
  useEffect(() => {
    const canAct = timed && !view.paused && acting && !!mainRef.current?.querySelector(ACTIONABLE);
    shellRef.current?.toggleAttribute('data-urgent', candidate && canAct);
    if (!canAct || seconds === null || seconds > 5) return;
    const key = `${view.phaseId}:${view.deadline ?? ''}`;
    const last = lastTicked.current?.key === key ? lastTicked.current.seconds : null;
    if (last === seconds) return;
    lastTicked.current = { key, seconds };
    if (seconds === 0) {
      if (last === null) return;
      audio?.play('error');
      buzz(BUZZ.timeup);
      return;
    }
    if (seconds === 5) audio?.play('tick');
    buzz(BUZZ.tick);
  }, [timed, view, seconds, acting, candidate, audio]);
  return { candidate, shellRef, mainRef };
}
