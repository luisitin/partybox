// The bot: it reads the same box everyone reads — from its own phone's view, never the stored
// outcome — and bets with a personality (0 cautious … 1 reckless, drawn at init): a cautious bot
// backs the likely content with a small stake, a reckless one chases long shots with a big one.
// Every content pays a little under fair odds, so no pick is "right": the personality is the play.
import type { Rng } from '@partybox/game-sdk';
import type { Input } from './types';
import type { BlindAuctionControllerView } from './views';

export function decide(view: BlindAuctionControllerView, factor: number, rng: Rng): Input | null {
  if (view.me.role !== 'player') return null;
  if (view.phaseId === 'rules') return view.ready ? null : { type: 'ready' };
  if (view.phaseId !== 'bet' || view.myBet !== null || !view.box) return null;
  const options = view.box.options;
  if (options.length === 0) return null;
  // Weight each content by its chance, bent by the personality toward the long shots.
  const weights = options.map((o) => Math.pow(o.chance / 100, 1.6 - 1.4 * factor));
  let roll = rng.float() * weights.reduce((a, b) => a + b, 0);
  let option = options.length - 1;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i] ?? 0;
    if (roll < 0) {
      option = i;
      break;
    }
  }
  // Now and then a bot sits a box out.
  if (rng.float() < 0.08) return { type: 'bet', option, amount: 0 };
  const share = 0.1 + factor * 0.4 + (rng.float() - 0.5) * 0.1;
  const amount = Math.min(view.coins, Math.max(5, Math.round((view.coins * share) / 5) * 5));
  return { type: 'bet', option, amount: view.coins <= 0 ? 0 : amount };
}
