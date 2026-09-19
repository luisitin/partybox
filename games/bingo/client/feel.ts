// What a phone does the moment the TV's verdict lands (loop 241): the claimant's win pops with a
// buzz and the 'correct' cue, their miss shakes (Controller.module.css .wiped) with a sad buzz and
// the 'error' cue; every other phone gets one soft tap on a win (loop 260). Once per claim; a
// ref, not state, so no render is scheduled.
import { useEffect, useRef } from 'react';
import { buzz } from '@partybox/game-sdk/ui';
import type { PlayCue } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { DEAL_BOUNCE_MS, DEAL_START_MS, DEAL_STEP_MS } from '../server/types';
import { BALL_LAND_MS } from './caller';
import { wantedCells } from './close';

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

/**
 * The deal's plucks: one soft 'card' as each card lands (owner's pick, options B + C), about a
 * second apart (loop 345); the timings mirror .dealing in the stylesheet, the pluck on the bounce.
 * One card plucks too (loop 278: the TV plucks the same beats). The hand feels each landing as
 * well — the same 12 ms tap a call gets (loop 380).
 */
export function useDealFeel(dealing: boolean, cards: number, round: number, play: PlayCue): void {
  useEffect(() => {
    if (!dealing) return;
    const handles = Array.from({ length: cards }, (_, i) =>
      setTimeout(
        () => {
          play('card');
          buzz(12);
        },
        DEAL_START_MS + i * DEAL_STEP_MS + DEAL_BOUNCE_MS,
      ),
    );
    return () => handles.forEach((h) => clearTimeout(h));
  }, [dealing, cards, play, round]);
}

/**
 * One to go (loop 420): the first time a live card is one daub from the pattern this round, a
 * hushed 'close' and a 20 ms buzz — once per card per round (a daub undone and redone stays
 * quiet), never on a card that already won, and not under the deal or a verdict. A ref, not state.
 */
export function useCloseFeel(view: BingoControllerView, play: PlayCue): void {
  const said = useRef<{ round: number; cards: number[] }>({ round: 0, cards: [] });
  const live = view.phaseId === 'play' && view.pausedBy.length === 0 && view.resumeAt === null;
  const close = live
    ? view.daubs
        .map((d, c) => (view.won.includes(c) || wantedCells(view.pattern, d).length === 0 ? -1 : c))
        .filter((c) => c >= 0)
    : [];
  const key = close.join(',');
  useEffect(() => {
    if (said.current.round !== view.round) said.current = { round: view.round, cards: [] };
    const fresh = close.filter((c) => !said.current.cards.includes(c));
    if (fresh.length === 0) return;
    said.current.cards.push(...fresh);
    play('close');
    buzz(20);
  }, [key, view.round, play]);
}
