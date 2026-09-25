// The bot: it reads the same box everyone reads — from its own phone's view, never the stored
// outcome — and bets with a personality (0 cautious … 1 reckless, drawn at init): a cautious bot
// backs the likely content with a small stake, a reckless one chases long shots with a big one.
// Every content pays a little under fair odds, so no pick is "right": the personality is the play.
import type { Rng } from '@partybox/game-sdk';
import { total as handTotal } from './phases/hands';
import type { Input } from './types';
import type { BlindAuctionControllerView } from './views';

export function decide(view: BlindAuctionControllerView, factor: number, rng: Rng): Input | null {
  if (view.me.role !== 'player') return null;
  if (view.phaseId === 'rules') return view.ready ? null : { type: 'ready' };
  // Hot potato: pass it on the moment it lands (the server makes you hold it a beat first).
  if (view.phaseId === 'potato')
    return view.potato?.holder === view.me.id ? { type: 'pass' } : null;
  // Blackjack: hit below 16, else stand (the house's own rule, near enough).
  if (view.phaseId === 'hands') {
    const hand = view.blackjack?.hands[view.me.id];
    if (!hand || view.blackjack?.stood.includes(view.me.id)) return null;
    return handTotal(hand) < 16 ? { type: 'hit' } : { type: 'stand' };
  }
  // Shell game: a bot 'follows the ball' about as well as a person — right more often than chance.
  if (view.phaseId === 'cups') {
    if (view.myStake <= 0 || view.myCup !== null) return null;
    return { type: 'cup', cup: Math.floor(rng.float() * 3) };
  }
  // Tug of war: pull (the server counts at most one tap every 80 ms).
  if (view.phaseId === 'tug') return view.myTeam === null ? null : { type: 'tug' };
  if (view.phaseId === 'swap') {
    // Doors: like people, most bots trust their first door; the bolder ones switch.
    if (view.myDoor === null || view.mySwap !== null || view.opened === null) return null;
    const others = [0, 1, 2].filter((d) => d !== view.opened && d !== view.myDoor);
    const forced = view.myDoor === view.opened;
    const move = forced || rng.float() < 0.35 + 0.3 * factor;
    const door = move ? (others[Math.floor(rng.float() * others.length)] ?? 0) : view.myDoor;
    return { type: 'swap', door };
  }
  if (view.phaseId !== 'bet' || view.myBet !== null || !view.box) return null;
  // Keno: three distinct numbers first, then the stake (next time round).
  if (view.box.event === 'keno' && view.mySpots.length !== 3) {
    const pool = Array.from({ length: 20 }, (_, i) => i + 1);
    const spots: number[] = [];
    while (spots.length < 3) {
      const n = pool.splice(Math.floor(rng.float() * pool.length), 1)[0];
      if (n !== undefined) spots.push(n);
    }
    return { type: 'spots', spots };
  }
  const options = view.box.options;
  if (options.length === 0) return null;
  // Weight each content by its chance, bent by the personality toward the long shots.
  const weights = options.map((o, i) =>
    // Never itself on hot potato (refused anyway).
    view.box?.event === 'potato' && i === view.mySeat
      ? 0
      : Math.pow(o.chance / 100, 1.6 - 1.4 * factor),
  );
  // Tug of war: your own side, always.
  if (view.box.event === 'tug') {
    for (let i = 0; i < weights.length; i++) if (i !== view.myTeam) weights[i] = 0;
  }
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
