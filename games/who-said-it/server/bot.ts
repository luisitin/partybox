// The bot (SPEC §4.10, ruling 20): it decides from its own phone's view and nothing else. It answers
// with its first dealt idea chip (dealt so bots lead with different answers), and guesses uniformly
// at random among its candidates. It sits out its own card, like a human author.
import type { Rng } from '@partybox/game-sdk';
import type { Input } from './types';
import type { WsPhoneView } from './views';

export function decide(view: WsPhoneView, rng: Rng): Input | null {
  if (view.me.role !== 'player') return null;
  if (view.phaseId === 'write' && view.myAnswer === null) {
    const text = view.ideas[0];
    if (text) return { type: 'answer', text };
    // A seat without its chips yet taps 💡 like a person would, then answers from them.
    return view.canIdea ? { type: 'idea' } : null;
  }
  if (view.phaseId === 'guess' && view.myGuess === null && view.candidates.length > 0)
    return { type: 'guess', target: rng.pick(view.candidates) };
  return null;
}
