// What the claimant's phone does the moment the TV's verdict lands on their claim (loop 241): a
// win pops with a buzz and the 'correct' cue, a miss shakes (Controller.module.css .wiped) with
// a sad buzz and the 'error' cue. Once per claim; a ref, not state, so no render is scheduled.
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
    if (!verdictShown || !claimKey || !mine || answered.current === claimKey) return;
    answered.current = claimKey;
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
  const callNumber = view.phaseId === 'play' ? (view.current?.number ?? null) : null;
  useEffect(() => {
    if (callNumber === null) return;
    const t = setTimeout(() => buzz(12), BALL_LAND_MS);
    return () => clearTimeout(t);
  }, [callNumber]);
}
