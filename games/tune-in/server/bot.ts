// The bot (spec §5.11). It decides from its own phone's view only (P00 §7.9): the target when it
// is the psychic, the clue, the needle, its own dial. The spectrum's clue bank is its general
// knowledge — the way a person knows coffee is hot — never the secret target.
import type { Rng } from '@partybox/game-sdk';
import { spectrumById } from './content';
import type { TuneControllerView } from './controller-view';
import { sameAnswer } from '@partybox/game-sdk/match';
import type { Input } from './types';

/** Where the bot believes the clue sits: a bank clue it recognises, else nothing. */
export function estimate(view: TuneControllerView): number | null {
  const spectrum = spectrumById(view.turn.spectrumId);
  const clue = view.turn.clue;
  if (!spectrum || !clue) return null;
  const known = spectrum.clues.find((c) => sameAnswer(c.text, clue, 'en'));
  return known ? known.pos : null;
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Psychic: one of the two bank clues nearest the target, so it plays well but not perfectly. */
function psychicClue(view: TuneControllerView, rng: Rng): Input | null {
  const spectrum = spectrumById(view.turn.spectrumId);
  const target = view.bullseyeAt;
  if (!spectrum || target === undefined || view.turn.clue !== null) return null;
  const nearest = [...spectrum.clues]
    .sort((a, b) => Math.abs(a.pos - target) - Math.abs(b.pos - target))
    .slice(0, 2);
  if (nearest.length === 0) return null;
  return { type: 'clue', text: rng.pick(nearest).text };
}

/** Guesser: the bank position ±8 (or anywhere 10–90), then lock. In a huddle it drifts toward its
 *  estimate for a beat or two first, so the room sees the markers argue. */
function guesserMove(view: TuneControllerView, rng: Rng): Input | null {
  if (view.locked) return null;
  const guess = estimate(view);
  const aim = guess === null ? rng.int(10, 90) : clamp(guess + rng.int(-8, 8));
  if (view.myDial === null) {
    const first = view.huddleMarks ? clamp(aim + rng.int(-20, 20)) : aim;
    return { type: 'dial', pos: first };
  }
  if (view.huddleMarks && view.myDial !== aim && rng.chance(0.45)) {
    return { type: 'dial', pos: clamp(view.myDial + (aim - view.myDial) / 2 + rng.int(-2, 2)) };
  }
  return { type: 'lock' };
}

/** Caller: the bank position against the needle (above → RIGHT, below → LEFT), else a coin. */
function callerTap(view: TuneControllerView, rng: Rng): Input | null {
  if (view.myCall !== null || view.needle === null) return null;
  const guess = estimate(view);
  if (guess === null || guess === view.needle)
    return { type: 'call', side: rng.pick(['left', 'right']) };
  return { type: 'call', side: guess > view.needle ? 'right' : 'left' };
}

export function decide(view: TuneControllerView, rng: Rng): Input | null {
  if (view.me.role !== 'player') return null;
  if (view.phaseId === 'intro')
    return view.ready || view.startAt !== null ? null : { type: 'ready' };
  if (view.phaseId === 'clue' && view.role === 'psychic') return psychicClue(view, rng);
  if (view.phaseId === 'dial' && view.role === 'guesser') return guesserMove(view, rng);
  if (view.phaseId === 'call' && view.role === 'caller') return callerTap(view, rng);
  return null;
}
