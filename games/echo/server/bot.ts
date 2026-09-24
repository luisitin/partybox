// Echo's bot (§7.11), deciding only from its own phone's view (foundation §7.9 rule 9).
// Clue-giver: a clue from the word's bank, weighted towards the obvious end, so bots echo each
// other sometimes, like people. Check: Looks good. Guesser: ranks the pack by how many surviving
// clues sit in each word's bank; with k hits it guesses the best word with p = 0.3 + 0.15k (≤ 0.85),
// else passes half the time and tries the runner-up the other half. Never taps Don't know it.
import type { Rng } from '@partybox/game-sdk';
import { PACK_LANG, rankByClues, wordById } from './content';
import { sameAnswer } from './match/index';
import type { Input } from './types';
import type { EchoControllerView } from './views';

/** Weighted towards the top of the bank: weight 10 for the first clue down to 1 for the last. */
function weightedClue(bank: readonly string[], rng: Rng, avoid: string | null): string | null {
  const options = bank.filter((c) => avoid === null || !sameAnswer(c, avoid, PACK_LANG));
  if (options.length === 0) return null;
  const weights = options.map((_, i) => options.length - i);
  let roll = rng.float() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i] as number;
    if (roll < 0) return options[i] as string;
  }
  return options[options.length - 1] as string;
}

function clueInput(view: EchoControllerView, rng: Rng): Input | null {
  if (!view.secret || view.myClues.length > 0) return null;
  const bank = wordById(view.secret.id)?.clues ?? [];
  const first = weightedClue(bank, rng, null);
  if (!first) return null;
  if (!view.tv.twoClues) return { type: 'clue', texts: [first] };
  const second = weightedClue(bank, rng, first);
  return second ? { type: 'clue', texts: [first, second] } : null;
}

function guessInput(view: EchoControllerView, rng: Rng): Input {
  const ranked = rankByClues(view.tv.survivors, view.spicy);
  const best = ranked[0];
  const k = best?.[1] ?? 0;
  // With nothing in any bank, any guess is a wild one that burns a word: pass (NOTES.md).
  if (!best || k === 0) return { type: 'pass' };
  const answer = (id: string | undefined): string | null =>
    id ? (wordById(id)?.answer ?? null) : null;
  if (rng.chance(Math.min(0.85, 0.3 + 0.15 * k)))
    return { type: 'guess', text: answer(best[0]) ?? 'pass' };
  const second = answer(ranked[1]?.[0]);
  if (!second || rng.chance(0.5)) return { type: 'pass' };
  return { type: 'guess', text: second };
}

export function decide(view: EchoControllerView, rng: Rng): Input | null {
  if (view.me.role !== 'player') return null;
  switch (view.phaseId) {
    case 'clue':
      return view.role === 'giver' ? clueInput(view, rng) : null;
    case 'check':
      return view.role === 'giver' && view.check && !view.check.ok ? { type: 'ok' } : null;
    case 'guess':
      return view.role === 'guesser' && !view.tv.guessIn ? guessInput(view, rng) : null;
    default:
      return null;
  }
}
