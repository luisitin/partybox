// What a phone does the moment the TV's verdict lands (loop 241): the claimant's win pops with a
// buzz and the 'correct' cue, their miss shakes (Controller.module.css .wiped) with a sad buzz and
// the 'error' cue; every other phone gets one soft tap on a win (loop 260). Once per claim; a
// ref, not state, so no render is scheduled.
import { useEffect, useRef } from 'react';
import { buzz } from '@partybox/game-sdk/ui';
import type { PlayCue } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { BALL_LAND_MS } from './caller';

export function useVerdictFeel(
  view: BingoControllerView,
  meId: string,
  claimKey: string | null,
  verdictShown: boolean,
  play: PlayCue,
): void {
  const answered = useRef<string | null>(null);
  const mine = view.claim?.playerId === meId;
  const phaseId = view.phaseId;
  useEffect(() => {
    if (!verdictShown || !claimKey || answered.current === claimKey) return;
    answered.current = claimKey;
    if (!mine) {
      // Everyone else feels a bingo land too — one soft tap as the TV's sting fires, no sound
      // (the TV carries the celebration; loop 260). A miss is the claimant's alone.
      if (phaseId === 'bingo') buzz(30);
      return;
    }
    if (phaseId === 'bingo') {
      buzz([40, 60, 40, 60, 120]);
      play('correct');
    } else if (phaseId === 'check') {
      buzz([120, 80, 120]);
      play('error');
    }
  }, [verdictShown, claimKey, mine, phaseId, play]);
}

/**
 * Every new number: a short buzz as the nickname lands — BALL_LAND_MS after the push, the beat
 * the TV's ball squashes on — so every phone in the room feels the call together (loop 248).
 */
export function useCallFeel(view: BingoControllerView): void {
  // A call is the server's stamp (loop 294): a countdown or a hold shows the number without
  // calling it, and the repeat after "keep going" is a new stamp — one buzz per real call.
  const stamp =
    view.phaseId === 'play' && view.resumeAt === null && view.pausedBy.length === 0
      ? view.calledAt
      : null;
  useEffect(() => {
    if (stamp === null) return;
    const t = setTimeout(() => buzz(12), BALL_LAND_MS);
    return () => clearTimeout(t);
  }, [stamp]);
}
